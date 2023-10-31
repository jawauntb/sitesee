import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
export default function Home() {
  const [websiteIdea, setWebsiteIdea] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const renderPrompt = '; return html with proper js and tailwinds functionality as a response. for it. make sure you use modern design with rounded edges, drop shadows, unified color palette of 3 colors, buttons scale on hover. should have a nav, a hero section with big text, lots of buttons, a sidebar, and social sharing icons, use fontawesome for icons in meta tags anad any font use googlefont. you can fill in with mock content to make more realistic. default to raleway font Now write the landing.html'

  async function makeAPIRequest(payload, callback) {
    fetch('https://emojipt-jawaunbrown.replit.app/promptly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payload })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data, 'data');
        if (data && data.choices && data.choices.length > 0) {
          const result = data.choices[0].message.content;
          callback(result); // Send back the generated text
        } else {
          console.error('Unexpected API response:', data);
        }
      })
      .catch(error => console.error('Error:', error));
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Create a landing page using tailwinds based on this idea: ${websiteIdea} ${renderPrompt}` }
      ]
    };

    await makeAPIRequest(payload, (response) => {
      setGeneratedContent(response);
      setIsLoading(false);
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@800&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <div className="bg-blue-500 w-full h-12 text-white font-bold text-center pt-3 p-4 tracking-wide" style={{ fontFamily: 'Raleway, sans-serif', fontSize: '24px' }}>
        SiteSee
      </div>

      {/* Rendered Content */}
      <div className="flex-grow flex items-center justify-center rounded-lg p-8 bg-white">
        <div className="shadow-xl w-9/12 rounded-lg bg-grey-500 transform transition-transform duration-100 hover:scale-105" dangerouslySetInnerHTML={{ __html: generatedContent }}></div>
      </div>

      {/* Input and Submit */}
      <div className="w-full p-4 bg-gray-100 fixed bottom-0 left-0 border-t rounded-lg h-auto">
        <input
          type="text"
          placeholder="Enter website idea..."
          className="w-full p-2 mb-2 border rounded"
          value={websiteIdea}
          onChange={(e) => setWebsiteIdea(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
