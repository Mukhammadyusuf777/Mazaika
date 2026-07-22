import builtins

file_path = 'C:/Mazaika/mazaika-backend/src/ai/antigravity.service.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Replace imports
content = content.replace("import Groq from 'groq-sdk';", "import Anthropic from '@anthropic-ai/sdk';")

# Replace class property
content = content.replace("private groq: Groq;", "private anthropic: Anthropic;")

# Replace constructor
new_constructor = """  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      this.logger.warn("ANTHROPIC_API_KEY is missing! AI features will fail.");
    }
    
    this.anthropic = new Anthropic({ apiKey: apiKey || 'dummy-key-to-avoid-crash' });
  }"""
content = re.sub(r'  constructor\(\) \{[\s\S]*?dummy-key-to-avoid-crash\' \}\);\n  \}', new_constructor, content)

# Replace generateFullProject API call
def replace_full_gen(match):
    return """      const completion = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        temperature: 0.5,
        system: systemInstruction,
        messages: [
          ...formattedHistory,
          { role: 'user', content: userPrompt }
        ],
      });

      const rawText = (completion.content[0] as any).text || '';
      const cleanedJson = this.cleanJsonResponse(rawText);"""

content = re.sub(r'      const completion = await this\.groq\.chat\.completions\.create\(\{[\s\S]*?this\.cleanJsonResponse\(rawText\);', replace_full_gen, content)

# Replace generatePatch API call
def replace_patch_gen(match):
    return """      const completion = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.5,
        system: systemInstruction,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      });

      const rawText = (completion.content[0] as any).text || '';
      const cleanedJson = this.cleanJsonResponse(rawText);"""

content = re.sub(r'      const completion = await this\.groq\.chat\.completions\.create\(\{[\s\S]*?this\.cleanJsonResponse\(rawText\);', replace_patch_gen, content)

# Also update the Groq error logs to Anthropic
content = content.replace("Ошибка от Groq:", "Ошибка от Anthropic:")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated to Anthropic Claude 3.5 Sonnet successfully.")
