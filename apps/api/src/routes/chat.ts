import { Hono } from 'hono'
import { streamText, convertToModelMessages, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { getBashTool } from '../tools/bash-tool'

const chatRouter = new Hono()

const bashToolPromise = getBashTool()

const edaQueryTool = tool({
  description: 'Query the current EasyEDA environment state including user, project, document, board, PCB, schematic, selection, team, workspace, and editor information. Returns a comprehensive snapshot of the current EDA context.',
  inputSchema: z.object({}),
})

const edaExecTool = tool({
  description: 'Execute arbitrary JavaScript code in the EasyEDA runtime with access to the global `eda` object. Use this to perform actions or query specific data not covered by eda_query. The code runs in an async context with `eda` injected. Enforces a timeout (default 30s).',
  inputSchema: z.object({
    code: z.string().describe('JavaScript code to execute. The `eda` object is available in scope. Must be valid async-capable code.'),
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
<Overview>    
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

</Overview>

<Guidelines>
You have access to EasyEDA API documentation in an in-memory filesystem at:
- guide/ - Getting started guides
- references/ - API reference documentation

Use the bash tool to search and read docs:
- grep -r "keyword" guide/ references/
- cat guide/how-to-start.md
- ls references/

Do NOT use destructive commands (rm, mv, etc).
</Guidelines>
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
