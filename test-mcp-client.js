// MCP client test script for the design selection tool
import { ModelContextProtocolClient } from '@modelcontextprotocol/sdk';

async function runTest() {
  try {
    // Create an MCP client connected to the local server
    const client = new ModelContextProtocolClient({
      transport: {
        type: 'http',
        url: 'http://localhost:4321'  // Default MCP port
      }
    });

    // Call the design selection tool with test data
    const result = await client.callTool('designselection', {
      design_name_1: "Expandable Chat Widget",
      design_html_1: `<div class="fixed bottom-6 right-6 z-50">
        <div class="bg-white rounded-lg shadow-lg p-4 max-w-md">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Chat with us</h3>
            <button class="text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="h-64 overflow-y-auto mb-4 border rounded p-2">
            <div class="flex flex-col space-y-2">
              <div class="bg-gray-100 rounded-lg p-2 self-start max-w-xs">
                <p class="text-sm">Hello! How can I help you today?</p>
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <input type="text" class="flex-1 border rounded-l-lg p-2" placeholder="Type your message...">
            <button class="bg-blue-500 text-white rounded-r-lg p-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>`,
      
      design_name_2: "Floating Chat Bubble",
      design_html_2: `<div class="fixed bottom-6 right-6 z-50">
        <button class="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-all">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
        </button>
      </div>`,
      
      design_name_3: "Interactive Chat Panel",
      design_html_3: `<div id="whatsapp-chat" class="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-lg shadow-xl overflow-hidden">
        <div class="bg-green-500 text-white p-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold">Support Chat</h3>
                <p class="text-xs opacity-80">Typically replies in under 5 minutes</p>
              </div>
            </div>
            <button class="text-white hover:text-gray-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="h-80 overflow-y-auto p-4 bg-gray-100">
          <div class="flex flex-col space-y-3">
            <div class="bg-white rounded-lg p-3 shadow-sm self-start max-w-xs relative">
              <p class="text-sm">👋 Hello! How can I assist you today?</p>
              <span class="text-xs text-gray-500 block mt-1">11:42 AM</span>
              <div class="absolute left-0 top-0 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45"></div>
            </div>
          </div>
        </div>
        <div class="bg-white p-3 border-t">
          <div class="flex items-center">
            <input type="text" class="flex-1 border rounded-full px-4 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Type a message...">
            <button class="ml-2 bg-green-500 text-white rounded-full p-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>`
    });

    console.log('Design selection result:', result);
  } catch (error) {
    console.error('Error calling design selection tool:', error);
  }
}

runTest(); 