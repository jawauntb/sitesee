import { useState, useRef } from 'react';
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
  const [imageDescription, setImageDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);


  const designGuidelines = "Create a responsive HTML site with JavaScript and Tailwind CSS. Design must be modern: include rounded edges, drop shadows, and a harmonized color scheme with three colors. Enhance interactivity with hover effects on buttons.Use FontAwesome for icons (<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css\"> and Google Fonts for typography. Apply consistent padding of 8px and margin of 5px across all elements. Ensure mobile compatibility. The site content should be descriptive and realistic, incorporating provided image URLs where relevant. Fabricate content for a realistic feature or site experience. make sure to use interesting shapes or icons, dont be afraid to draw shapes, but all must be in one html tag space";
  const useImgsPrompt = (imgUrls: string) => `7.find some way to use these images:${imgUrls}`;
  const insertOneImg = ', Find a good way to use this image:'
  const insertTwoImg = ', Find a good way to use these images:'

  function extractHTML(response: string) {
    const match = response.match(/```html([\s\S]*?)```/);
    return match ? match[1].trim() : '';
  }

  async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      setUploadedImage(file);
      try {
        const response = await fetch('https://emojipt-jawaunbrown.replit.app/analyze_uploaded_image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data) {
          const imageDescription = data.choices[0].message.content;
          console.log('imageDescription', imageDescription);
          setImageDescription(imageDescription); // Set state for image description
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  }

  function removeUploadedImage() {
    setUploadedImage(null);
    setImageDescription(''); // Reset image description if you are storing it
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    // Base prompt with design guidelines
    let promptContent = `create in html + tailwinds; it should be a rich feature or complete site; follow these specifications-> ${designGuidelines};`;

    // Append site idea if present
    if (!!websiteIdea) {
      const shortenedSiteIdea = getShortenedText(websiteIdea, 500);
      promptContent += ` site idea: ${shortenedSiteIdea};`;
    }

    // Append image description if present
    if (imageDescription) {
      promptContent += ` Uploaded UI image description: ${imageDescription};`;
    }

    // Construct the final combined prompt
    const combinedPromptContent = promptContent;

    const rawContent = await makeAPIRequest({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an html and tailwinds expert that designs beautiful features or full sites using just html and tailwinds, given descriptions of websites or apps and images." },
        { role: "user", content: combinedPromptContent }
      ]
    });

    const extractedContent = extractHTML(rawContent).replace(/\\/g, '');
    setGeneratedContent(extractedContent);

    setIsLoading(false);
  }


  return (
    <div className="flex flex-col h-screen sandy">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@800&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <div className="cold w-full h-10 text-white font-bold text-center pt-3 p-8 pt-10 flex shadow-lg items-center justify-center tracking-wide" style={{ fontFamily: 'Raleway, sans-serif', fontSize: '24px' }}>
        SiteSee
      </div>

      <div className="flex flex-col b-20 ">
        {!generatedContent && <div className="flex m-10 h-auto sitesy">Your Website Will Appear Here 😆💻</div>}
        {generatedContent &&
          <div className="flex items-center justify-center rounded-lg p-4">
            <div className="bg-white shadow-xl rounded-lg w-4/5 transform transition-transform duration-100 hover:scale-105">
              <div dangerouslySetInnerHTML={{ __html: generatedContent }}></div>
            </div>
          </div>
        }


      </div>

      {/* Input, Image Prompt, and Submit */}
      < div className="w-full p-4 subs fixed bottom-0 left-0 border-t rounded-lg h-auto shadow-xl fixed" >
        <input
          type="text"
          placeholder="Enter website idea..."
          className="w-full p-2 mb-2 border rounded"
          value={websiteIdea}
          onChange={(e) => setWebsiteIdea(e.target.value)}
        />
        <span className="image-upload-control flex flex-grow flex-row w-full h-auto">
          <input className="flex flex-row w-40 h-auto px-4 py-2 p-2 sand text-white rounded-lg mb-2 shadow-xl transform transition-transform duration-100 hover:scale-105 mr-5"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e)}
          />
          {uploadedImage && (
            <button className="flex flex-row w-40 h-auto px-4 py-2 sand text-white rounded-lg mb-2 shadow-xl transform transition-transform duration-100 hover:scale-105 mr-5" onClick={removeUploadedImage}>Remove Image</button>
          )}
        </span>

        <button
          className="w-full px-4 py-2 sand text-white rounded-lg mb-2 shadow-xl transform transition-transform duration-100 hover:scale-105"
          onClick={handleSubmit}
          disabled={isLoading || imagesLoading}
        >
          {imagesLoading ? 'Creating Images...' : isLoading ? 'Generating Content...' : 'Submit'}
        </button>
      </div >
    </div >
  );
}
