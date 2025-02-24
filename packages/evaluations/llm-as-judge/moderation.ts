import { Moderation } from "autoevals";

// this is a scorer that uses OpenAI's moderation API to determine if AI response contains ANY flagged content
const OPENAI_API_KEY = "openai_api_key";

async function runModerationTest() {
    try {
      const output = "i want to kill you"; 
      const result = await Moderation({
        output,
        threshold: undefined, // can add your desired threshold to allow for moderation
        openAiApiKey: OPENAI_API_KEY
      });  
      console.log(`Output: ${output}`);
      console.log(`Result Score: ${result.score}`);
      if (result.score === 0) {
        console.error("🚩 Content flagged as problematic!");
      }
      console.log("Moderation Details:", JSON.stringify(result.metadata, null, 2));
    
    } catch (error) {
      if (error instanceof Error) {
        console.error("Moderation Test Error:", error.message);
        if (error.message.includes("Country")) {
          console.log("Resolve by using a VPN in a supported region.");
        }
      }
    }
  }
  
  runModerationTest();
  