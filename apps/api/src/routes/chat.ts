import { Hono } from 'hono'
import { streamText, convertToModelMessages, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { getBashTool } from '../tools/bash-tool'

const chatRouter = new Hono()

const bashToolPromise = getBashTool()

const edaQueryTool = tool({
  description: 'Query the current EasyEDA environment state. Returns: user info, project info, active document (schematic/PCB), board dimensions, PCB/schematic primitives, selected objects, team info, workspace info, and editor version. Use this as the first step to understand the current design context.',
  inputSchema: z.object({}),
})

const edaExecTool = tool({
  description: 'Execute arbitrary JavaScript code in the EasyEDA runtime with access to the global `eda` object. IMPORTANT: Your code MUST return a result using `return` statement - console.log output is NOT captured. Use return to provide useful information about the schematic, PCB, components, selection, or any other EDA data. The code runs in an async context with `eda` injected. Enforces a timeout (default 30s). Example: `return await eda.sch_SelectControl.getAllSelectedPrimitives();`',
  inputSchema: z.object({
    code: z.string().describe('JavaScript code to execute. The `eda` object is available in scope. Must be valid async-capable code. MUST include a return statement to provide results.'),
    timeout: z.number().optional().describe('Timeout in milliseconds (default 30000)'),
  }),
})

chatRouter.post('/chat', async c => {
  const { messages } = await c.req.json()

  const apiKey = process.env.NVIDIA_API_KEY
  const baseURL = 'https://integrate.api.nvidia.com/v1'

  if (!apiKey) {
    return c.json({ error: 'NVIDIA_API_KEY not configured' }, 500)
  }

  const client = createOpenAICompatible({
    name: 'nim',
    apiKey,
    baseURL,
  })

  const today = new Date().toUTCString().slice(0, 16) // e.g. "Sat, 01 Jul 2023"

  console.log('Received messages', messages.length);
  const modelMessages = await convertToModelMessages(messages)
  const { bash } = await bashToolPromise
  const result = streamText({
    model: client('openai/gpt-oss-120b'),
    system: `Today is ${today}, You are Cirai, an circuit design assistant for EasyEDA Pro. 
<EDA_Query_Tool>
你可以使用 \`eda_query\` 工具一键获取当前 EasyEDA 环境的状态，包括用户、项目、文档、板级、PCB、原理图、选区、团队、工作区和编辑器信息等。这个工具会返回当前 EDA 上下文的全面快照，帮助你了解用户当前的设计环境和状态。
</EDA_Query_Tool>

<EDA_Exec_Tool>
你可以使用 \`eda_exec\` 工具在 EasyEDA 运行时执行任意 JavaScript 代码，并访问全局的 \`eda\` 对象。使用这个工具来执行操作或查询特定数据。代码在一个异步上下文中运行，并注入了 \`eda\` 对象。请注意，执行的代码必须是有效的异步代码，并且会强制执行一个超时（默认 30 秒）。
</EDA_Exec_Tool>

<EDA_API_Access>
嘉立创 EDA 专业版扩展 API 模块下存在许多各司其职的类，所有的 **类**、**枚举**、**接口**、**类型别名** 默认都注册在 \`EDA\` 基类下，并已实例化为 [eda](references/_index.md) 对象存在于每一个扩展运行时的根作用域中，你可以直接通过 \`eda\` 对象访问到它。

所有的扩展运行时都会获得一个独立的 \`eda\` 对象，它不与其他扩展共用。你可以在 [调试模式](#进入调试模式) 下在扩展内（或 [独立脚本](#使用独立脚本功能调试) 内）使用以下代码在控制台输出该对象：

\`\`\`javascript
console.log('[DEBUG] eda:', eda);
\`\`\`

标准的扩展 API 调用需要拼接 **eda** + **类实例对象名** + **方法名 / 变量名**。系统内实例化的类对应的对象名称为下划线前三个字母小写的形式，例如：

| 类名             | 类实例对象名     |
| ---------------- | ---------------- |
| SYS_I18n         | sys_I18n         |
| SYS_ToastMessage | sys_ToastMessage |

如下示例为调用 \`SYS_I18n\` 类下的 \`text\` 方法和 \`SYS_ToastMessage\` 类下的 \`showMessage\` 方法：

\`\`\`typescript {2}
// 注意 sys_I18n 的 sys 为小写，这是因为我们调用的时候需要使用对象名称
eda.sys_ToastMessage.showMessage(eda.sys_I18n.text('Done'), ESYS_ToastMessageType.INFO);

const t = eda.sys_I18n.text; // 将 eda.sys_I18n.text 方法赋值给 t
eda.sys_ToastMessage.showMessage(t('Done'), ESYS_ToastMessageType.INFO); // 这将会与第 2 行得到完全相同的结果
\`\`\`


You have access to EasyEDA API documentation in an in-memory filesystem at:
- guide/ - Getting started guides
- references/ - API reference documentation

Use the bash tool to search and read docs:
- grep -r "keyword" guide/ references/
- cat guide/how-to-start.md
- ls references/

Do NOT use destructive commands (rm, mv, etc).
</EDA_API_Access>
`,
    messages: modelMessages,
    tools: { bash, eda_query: edaQueryTool, eda_exec: edaExecTool },
    stopWhen: stepCountIs(20),
    onStepFinish: (step) => {
      if (step.toolCalls.length > 0) {
        console.log('Tool calls in this step:', step.toolCalls)
      }
      if (step.toolResults.length > 0) {
        console.log('Tool results in this step:', step.toolResults)
      }
    }
  })

  return result.toUIMessageStreamResponse()
})

export { chatRouter }
