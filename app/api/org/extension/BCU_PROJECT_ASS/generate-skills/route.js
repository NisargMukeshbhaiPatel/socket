import { OPENAI_API_KEY } from "@/lib/env";
import OpenAI from "openai";

const openAi = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
/**
 * @param {string} type PROJECT or USER
 */
export const generateSkills = async (type, name, description, available) => {
  const selectedSkills = [];
  if (openAi) {
    console.log("Generating Skills using Open Ai for ", type, name, description);
    
    const prompt = available ? `Based on the following ${type} details, extract exactly 4-5 of the most relevant and technically aligned skills STRICTLY from the list of Available Skills. DO NOT invent or include any skills that are not in the Available Skills list. ONLY choose skills that are present in the list. Ignore any related but unavailable terms.

${type} Name: ${name}
${type} Description: ${description}
Available Skills: ${available}

Instructions:
1. Carefully analyze the project.
2. Select only 4-5 of the most relevant technical skills from the **Available Skills** list.
3. DO NOT make up any new skills or include ones not in the list.
4. Your response must be a single line with only comma-separated values, with no extra explanation.

Your response (4-5 skills only):`: `Based on the following ${type} details, give exactly 4-5 most relevant skills:

${type} Name: ${name}
${type} Description: ${description}

Instructions:
1. Analyze the ${type.toLowerCase()} information
2. List ONLY 4-5 most crucial technical skills.
3. Format your response as a single line with comma-separated values

Your response (4-5 skills only):`;

    console.log("Prompt: ", prompt);

    const completion = await openAi.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [{ role: "user", content: prompt }],
    });

    const message = completion.choices[0].message.content;
    console.log("Generated Skills: ", message);
    message.split("\n").map((line) => {
      const skills = line.split(",").map((item) => item.trim().toLowerCase());
      selectedSkills.push(...skills);
    });
    
    return available ? selectedSkills.filter((skill) => available.includes(skill)) : selectedSkills;
  } else {
    throw new Error("OpenAI API Key not found");
  }
};

export async function POST(request) {
  try {
    const res = await request.json();
    const { projectName, projectDescription, availableSkills } = res;
    const skills = await generateSkills("PROJECT", projectName, projectDescription, availableSkills);

    return new Response(JSON.stringify(skills), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.log(e);
    return new Response(
      JSON.stringify({ error: "Failed to generate skills", message: e.message, stack: e.stack }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
