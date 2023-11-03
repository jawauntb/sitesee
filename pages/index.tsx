import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [websiteIdea, setWebsiteIdea] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [imagePlaceholders, setImagePlaceholders] = useState([]);
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);

  const designGuidelines = "; return html with proper js and tailwinds functionality as a response. Make sure you use modern design with rounded edges, drop shadows, unified color palette of 3 colors, buttons scale on hover. Use FontAwesome for icons (<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css\"> and any font use GoogleFont.everything needs padding of 8px and margin of 5px. should be mobile friendly too; make sure to add descriptive site content based on input, insert the img urls we pass to you; dont leave content empty--make it realistic; Now write our landing.html, make up stuff if needed for realistic copy; mobile friendly also;";
  const useImgsPrompt = (imgUrls:string) => `7.find some way to use these images:${imgUrls}`;
  const insertOneImg = ', Find a good way to use this image:'
  const insertTwoImg = ', Find a good way to use these images:'
  function extractHTML(response: string) {
    const match = response.match(/```html([\s\S]*?)```/);
    return match ? match[1].trim() : '';
  }

  async function makeAPIRequest(payload) {
    try {

      const response = await fetch('https://emojipt-jawaunbrown.replit.app/sitesee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payload })
      });

      const data = await response.json();
      if (data && data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected API response:', data);
        return '';
      }
    } catch (error) {
      console.error('Error processing section:', error);
    } // End of try-catch block
  }

  async function fetchImages(imgPrompt) {
    const payload = { prompt: imgPrompt, n: 1, size: "256x256" }
    const response = await fetch('https://emojipt-jawaunbrown.replit.app/gen_image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }) // use generatedImagePrompt here
    });
    const data = await response.json();
    setImagesLoading(false)

    // Extract the urls from the data array and unescape them
    const unescapedUrls = data.data.map(item => item.url.replace(/\\/g, ''));
    return unescapedUrls;
  }

  async function getImagePrompt() {
    const shortenedSiteIdea = getShortenedText(websiteIdea, 300);
    setImagesLoading(true);
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Generate a prompt we can use to request dalle to make images that go with this landing page idea for the hero, and 2/3 other sections: ${shortenedSiteIdea}` }
      ]
    };
    const promptResponse = await makeAPIRequest(payload);
    const shortPrompt = getShortenedText(promptResponse, 400)
    setGeneratedImagePrompt(shortPrompt);
    // Return the prompt for the image generation and not the image itself
    return shortPrompt;

  }

  function getShortenedText(input, len) {
    const ssi = input.slice(0, len); + input.slice(input.length - len, input.length)
    return ssi
  }

  async function handleSubmit() {
    setIsLoading(true);

    // Get the image prompt based on website idea
    // const newPrompt = await getImagePrompt();

    // // Fetch images
    // const fetchedImageUrls = await fetchImages(newPrompt);
    // setImageUrls(fetchedImageUrls);

    const shortenedSiteIdea = getShortenedText(websiteIdea, 500);
    const imgUrls = imageUrls.join(' ');
    // Create a single combined prompt for the entire site
    const combinedPromptContent = ` make a site in html + tailwinds for this site:
      site idea: ${shortenedSiteIdea};
      follow these specificiations->
      1.create a header + navigation section.;
      2.a hero section with a value prop;
      3.a section with buttons or quotes;
      4. a content section.;
      5.a footer section.;  8..here are some rules for your response: ${designGuidelines};
    `;

    const rawContent = await makeAPIRequest({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an html and tailwinds expert that designs beautiful websites using just html and tailwinds." },
        { role: "user", content: combinedPromptContent }
      ]
    });

    const extractedContent = extractHTML(rawContent).replace(/\\/g, '');
    setGeneratedContent(extractedContent);

    setIsLoading(false);
  }

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
        <div className="shadow-xl rounded-lg w-4/5 bg-grey-500 transform transition-transform duration-100 hover:scale-105">
          <div dangerouslySetInnerHTML={{ __html: generatedContent }}></div>
        </div>
      </div>


      {/* Input, Image Prompt, and Submit */}
      < div className="w-full p-4 bg-gray-100 fixed bottom-0 left-0 border-t rounded-lg h-auto" >
        <input
          type="text"
          placeholder="Enter website idea..."
          className="w-full p-2 mb-2 border rounded"
          value={websiteIdea}
          onChange={(e) => setWebsiteIdea(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg mb-2"
          onClick={handleSubmit}
          disabled={isLoading || imagesLoading}
        >
          {imagesLoading ? 'Creating Images...' : isLoading ? 'Generating Content...' : 'Submit'}
        </button>
      </div >
    </div >
  );
}
