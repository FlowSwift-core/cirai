import { Hono } from 'hono'
import { streamText, convertToModelMessages, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { getBashTool } from '../tools/bash-tool'

const chatRouter = new Hono()

const bashToolPromise = getBashTool()

const edaExecTool = tool({
  description: 'Execute JavaScript code in EasyEDA runtime and get results with current environment status. The code MUST use `return` statement - console.log is not captured. Automatically includes current project, document, selection count, and error/warning status in the `_status` field. Large outputs (>2000 chars) are automatically truncated with `_truncated: true` and `shown/total` counts.',
  inputSchema: z.object({
    code: z.string().describe('JavaScript code to execute. The `eda` object is available. MUST include return statement.'),
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
<EDA_Exec_Tool>
你可以使用 \`eda_exec\` 工具在 EasyEDA 运行时执行任意 JavaScript 代码。

重要提示：
- 代码必须包含 \`return\` 语句来返回结果，console.log 输出不会被捕获
- 代码运行在异步上下文中，可以使用 async/await
- 执行超时默认为 30 秒
- 返回结果会自动包含 \`_status\` 字段，显示当前环境状态：
  - project: 项目名称
  - document: { name, type, modified }
  - selectionCount: 选中对象数量
  - hasError: 是否有错误
  - warningCount: 警告数量
- 大输出(>2000字符)会自动截断，包含 \`_truncated: true\` 和 \`shown/total\` 计数
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
    tools: { bash, eda_exec: edaExecTool },
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
