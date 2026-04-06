import { GoogleGenAI } from "@google/genai";
import { FundingCall, Proposal, TeamMember, PetitionInfo } from "../types";
import { v4 as uuidv4 } from 'uuid';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean JSON string from markdown code blocks and conversational text
const extractJson = (text: string): string => {
  // 1. Try to match markdown code blocks
  const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (markdownMatch) {
    return markdownMatch[1];
  }

  // 2. Fallback: Find the outermost JSON array or object
  const firstOpenBrace = text.indexOf('{');
  const firstOpenBracket = text.indexOf('[');
  
  let start = -1;
  let end = -1;

  // Determine if it looks like an object or an array starts first
  if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
    start = firstOpenBrace;
    end = text.lastIndexOf('}');
  } else if (firstOpenBracket !== -1) {
    start = firstOpenBracket;
    end = text.lastIndexOf(']');
  }

  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }

  // 3. Return original text if no JSON structure found (will likely fail parsing, but good for debugging)
  return text;
};

export const searchFundingCalls = async (query: string): Promise<FundingCall[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const currentDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    You are an expert research assistant for IEEE members. 
    Your task is to find active and upcoming funding calls, grants, scholarships, travel awards, and recognition awards provided by IEEE Societies, Councils, and Affinity Groups.

    Current Date: ${currentDate}

    Please prioritize searching within the following key IEEE resources:
    - https://students.ieee.org/student-opportunities/
    - https://students.ieee.org/
    - https://magazine.ieee.org/
    - https://www.ieeefoundation.org/
    - https://hac.ieee.org/
    - https://ieeexplore.ieee.org/
    - https://spectrum.ieee.org/
    - https://www.ieee.org/about/awards/index.html
    - https://brand-experience.ieee.org/
    - https://www.ieee.org/sitemap.html
    - https://www.computer.org/volunteering/awards
    - https://www.comsoc.org/about/awards
    - https://signalprocessingsociety.org/get-involved/awards-submit-award-nomination
    - https://ieee-pes.org/about-pes/awards/
    - https://www.ieee-ras.org/awards-recognition
    - https://cis.ieee.org/awards
    
    User Query: "${query}"

    Please use Google Search to find real, up-to-date information, focusing on the sites listed above but not limited to them.
    
    SEARCH STRATEGY:
    1. Search for "Student Grants", "Travel Grants", "Scholarships", and "Fellowships" across major IEEE Societies.
    2. Search for "Young Professionals" and "Women in Engineering" specific funding.
    3. Search for "Humanitarian Activities" and "SIGHT" group funding.
    4. Search for "Chapter Support" and "Regional" awards.

    Format the output strictly as a JSON array of objects. Do not include any conversational text outside the JSON block.
    Each object must have the following fields:
    - title: (string) The name of the grant, call, or award.
    - organization: (string) The IEEE entity offering it (e.g., "IEEE Computer Society").
    - deadline: (string) The specific deadline date or "Open" if rolling. Format as "YYYY-MM-DD" if possible, or readable text.
    - amount: (string) The monetary value (e.g., "$1,000", "Up to $5,000", "Varies", "Plaque").
    - description: (string) A brief summary of the opportunity (max 30 words).
    - eligibility: (string) Who can apply (e.g., "Student Members", "Graduate Students", "Women in Engineering").
    - url: (string) The EXACT source URL where you found this information. Do NOT guess or construct URL paths. If the specific page URL is not available in the search results, return the main "Opportunities" or "Awards" page URL for that IEEE society.
    - category: (string) One of: "Research", "Travel", "Event", "Scholarship", "Award", "Other".

    IMPORTANT: 
    1. Verify that every URL exists and is not a hallucination. 
    2. Prefer the main listing page (e.g., "https://students.ieee.org/student-opportunities/") over specific deep links if you are unsure.
    3. If you cannot find specific active calls matching the query, find general standing funding programs for the relevant societies.
    4. EXCLUDE any opportunities with deadlines that have already passed as of ${currentDate}. Only return "Open", "Rolling", or future deadlines.

    Return at least 15-20 results if possible to ensure comprehensive coverage.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || '';
    const jsonString = extractJson(text);
    
    try {
      const data = JSON.parse(jsonString);
      
      // Validate and sanitize data
      if (Array.isArray(data)) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return data.map((item: any) => {
          let url = item.url || "#";
          if (url !== "#" && !url.startsWith("http")) {
            url = `https://${url}`;
          } else if (url.startsWith("http://")) {
            url = url.replace("http://", "https://");
          }

          return {
            id: uuidv4(),
            title: item.title || "Untitled Opportunity",
            organization: item.organization || "IEEE",
            deadline: item.deadline || "Unknown",
            amount: item.amount || "See details",
            description: item.description || "No description available.",
            eligibility: item.eligibility || "See details",
            url: url,
            category: ["Research", "Travel", "Event", "Scholarship", "Award", "Other"].includes(item.category) ? item.category : "Other"
          };
        }).filter((item: FundingCall) => {
           // Client-side date filtering as a safety net
           const deadlineLower = item.deadline.toLowerCase();
           if (deadlineLower.includes('open') || deadlineLower.includes('rolling') || deadlineLower.includes('unknown')) {
             return true;
           }
           
           const date = new Date(item.deadline);
           if (!isNaN(date.getTime())) {
             // If the date is valid and strictly in the past, filter it out
             if (date < now) {
               return false;
             }
           }
           return true;
        });
      }
      return [];
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", parseError);
      console.log("Raw text:", text);
      console.log("Extracted JSON:", jsonString);
      throw new Error("Could not structure the search results. Please try again.");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const searchPetitions = async (query: string, category: string = 'All'): Promise<PetitionInfo[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  let promptCategoryInstruction = "";
  if (category === 'Societies') {
    promptCategoryInstruction = "STRICTLY LIMIT results to IEEE Societies. Do NOT include Councils or Affinity Groups.";
  } else if (category === 'Councils') {
    promptCategoryInstruction = "STRICTLY LIMIT results to IEEE Councils. Do NOT include Societies or Affinity Groups.";
  } else if (category === 'Affinity Groups') {
    promptCategoryInstruction = "STRICTLY LIMIT results to IEEE Affinity Groups (e.g., WIE, YP, LMAG, SIGHT).";
  }

  const prompt = `
    You are an expert on IEEE administrative processes.
    Your task is to find information and official links for filing petitions within IEEE Societies, Councils, and Affinity Groups.
    This includes petitions to form new Chapters, Student Branches, Affinity Groups, or petitions for nomination to office.

    User Query: "${query}"
    Category Filter: ${category}
    ${promptCategoryInstruction}

    Please prioritize searching within:
    - https://www.ieee.org/societies/
    - https://mga.ieee.org/
    - https://www.ieee.org/about/corporate/election/
    - Specific society websites (e.g., computer.org, comsoc.org)

    Format the output strictly as a JSON array of objects.
    Each object must have:
    - title: (string) What the petition is for (e.g., "Petition to Form a New Chapter").
    - organization: (string) The IEEE entity (e.g., "IEEE Power & Energy Society").
    - description: (string) Brief explanation of the purpose or requirement.
    - url: (string) The EXACT source URL for the petition form or guidelines.
    - type: (string) One of: "New Unit", "Nomination", "Other".
    - category: (string) One of: "Society", "Council", "Affinity Group", "Other".

    IMPORTANT:
    1. Verify URLs exist.
    2. If a specific petition page isn't found, link to the society's "Chapters" or "Volunteer" page.
    3. Respect the Category Filter. If the user asks for Societies, do not return Councils.

    Return at least 5-10 results.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || '';
    const jsonString = extractJson(text);
    
    try {
      const data = JSON.parse(jsonString);
      
      if (Array.isArray(data)) {
        return data.map((item: any) => {
          let url = item.url || "#";
          if (url !== "#" && !url.startsWith("http")) {
            url = `https://${url}`;
          } else if (url.startsWith("http://")) {
            url = url.replace("http://", "https://");
          }

          return {
            id: uuidv4(),
            title: item.title || "Petition Info",
            organization: item.organization || "IEEE",
            description: item.description || "No description available.",
            url: url,
            type: ["New Unit", "Nomination", "Other"].includes(item.type) ? item.type : "Other",
            category: ["Society", "Council", "Affinity Group", "Other"].includes(item.category) ? item.category : "Other"
          };
        });
      }
      return [];
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", parseError);
      return [];
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateProposal = async (call: FundingCall, userIdea: string, teamMembers: TeamMember[] = []): Promise<Proposal> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const teamContext = teamMembers.length > 0 
    ? teamMembers.map(m => `- ${m.role}: ${m.name} (${m.affiliation})`).join('\n') 
    : "No specific team members listed.";

  const prompt = `
    You are an expert grant writer specializing in IEEE funding applications.
    
    CONTEXT - FUNDING CALL:
    Title: ${call.title}
    Organization: ${call.organization}
    Description: ${call.description}
    Amount Available: ${call.amount}
    Eligibility: ${call.eligibility}

    PROJECT TEAM:
    ${teamContext}

    USER'S PROJECT IDEA:
    "${userIdea}"

    TASK:
    Draft a professional, winning project proposal and a detailed budget plan specifically tailored to this funding opportunity.
    Ensure the tone is academic yet persuasive.
    The budget should be realistic, itemized, and align with the "Amount Available".
    Incorporate the team members' potential roles and expertise where appropriate in the methodology or resource section.

    OUTPUT FORMAT:
    Return strictly a JSON object (no markdown, no extra text) with the following structure:
    {
      "projectTitle": "A professional and catchy title based on the idea",
      "executiveSummary": "A compelling 100-150 word summary.",
      "problemStatement": "Clear definition of the problem being solved.",
      "objectives": ["Objective 1", "Objective 2", "Objective 3"],
      "methodology": "How the project will be executed.",
      "impact": "Expected benefits to the technical community and humanity.",
      "timeline": "A structured text description of the timeline (e.g., Phase 1, Phase 2).",
      "timelinePhases": [
        { "phase": "Name of Phase 1", "startMonth": 1, "durationMonths": 2 },
        { "phase": "Name of Phase 2", "startMonth": 3, "durationMonths": 3 }
      ],
      "executionSteps": [
        { "stepNumber": 1, "title": "Inception", "description": "Short description of this step." },
        { "stepNumber": 2, "title": "Development", "description": "Short description of this step." }
      ],
      "budgetItems": [
        { "category": "Equipment/Travel/Personnel", "item": "Name of item", "cost": "Estimated cost", "justification": "Why this is needed" }
      ],
      "totalBudget": "Sum of costs",
      "incomeItems": [
         { "source": "Funding Source Name", "status": "Pending/Confirmed", "amount": "Amount" }
      ],
      "resourceAllocations": [
         { "role": "Role Name", "count": 1, "duration": "Duration", "responsibility": "Key Responsibility" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json' 
      }
    });

    const text = response.text || '';
    const jsonString = extractJson(text);
    const proposal = JSON.parse(jsonString) as Proposal;
    
    // Attach the input team members to the output proposal object
    proposal.teamMembers = teamMembers;
    
    return proposal;

  } catch (error) {
    console.error("Gemini Proposal Generation Error:", error);
    throw new Error("Failed to generate proposal. Please try again.");
  }
};