# twilio-dcd (Deployable Conversations Demo)

## A deployable and customizable demo that shows off key functionality and concepts of Twilio Conversations.

If you read this... Twilio Conversations is an omni-channel messaging platform that allows you to build engaging conversational messaging experiences across many channels. ... what does it really mean?

Omni-channel and conversational messaging sound great, but how can I visualize what I can build with Twilio Conversations?

This demo is a working app that is part contact center and part messaging app that you can deploy to your own Twilio Account. This project uses Conversations along with Twilio Functions and Twilio Sync.

Here is an overview of the demo application and everything including in this repo:

![Deployable Conversations Demo](https://user-images.githubusercontent.com/78064764/201012578-803f7a86-6204-457d-925c-53e568cfc384.png)

The "customizable code base" at the bottom is what you will deploy from this repo. You will use a Twilio Flex Instance, Twilio Functions, Twilio Sync, and Twilio Servics. Customers/Prospects will be able to interact with this platform via a single page application and their devices. Finally, a single page application for agents will be embedded into Flex for the agent's "single pane of glass".

1. Download this repo
2. run `npm install` from the main directory to add all of the necessary node 
3. In the main directory, copy the file "sample.env" and rename the copy to ".env"
4. From your Twilio account, create a new Conversation Service
    1. Copy the SID for the Conversation Service and paste it into the .env file (CHAT_SID)
5. Create a new SYNC Service called "TwilioTable"
    1. Copy the SID for the SYNC Service and paste it into the .env file
6. From the Twilio Console, under ACCOUNT, select "API Keys and Tokens"
    1. Create a new API Key and copy and past the key and the secret and paste them into the .env file
7. Create a new Messaging Service
    1. Copy the SID for the Messaging Service and paste it into the .env file
    2. Set the Integration for Incoming Messages for the Messaging Service to be "Autocreate a Conversation" 
    3. Add a phone number into the Messaging Service
        1. Copy the E.164 phone number into the .env file
8. Under Conversations > Manage > Defaults, set the Default Message Service to be the Messaging Service you created and the Default Conversation Service to be the Conversation Service you created
9. Deploy the Twilio serverless service
    1. Run `twilio login` or `twilio profiles:list` and `twilio profiles:use` to be sure that you are deploying to the same account as your Flex account from step 1.
    2. Run `twilio serverless:deploy`
    3. Go to the console and navigate to Functions => Service => twilio-dcd
    4. Find the asset /clients/twilio-table/index.html, click on the COPY URL link and save the URL -- this is the link to access your newly deployed TwilioTable instance (used to store all data for the applications).
    5. Find the asset /clients/agent-view/index.html, click on the COPY URL link and save the URL -- this is the link to access the agent or admin facing single page application. 
    5. Find the asset /clients/end-user-view/index.html, click on the COPY URL link and save the URL -- this is the link to access the customer facing single page application. You will give this URL to customers when you want them to interact with the Conversations Demo.
10. Paste the URL for TwilioTable that you copied in earlier into a web browser.
    1. Create the main table
    2. For each JSON file (3 of them) listed in the sync-demo-gui-json directoty, click on LISTS => NEW LIST in TwilioTable, select ADD FROM JSON, copy the json from the file, paste the json, check and then save to add the list to your TwilioTable instance.
11. For the json file(s) listed in the studio-json directory, create a new Studio Flow from the Console by selecting new flow, use the name of each JSON file as the name of the flow, and then use the import from JSON option, to create the new flow. 
    1. In TwilioTable, update the WebhookList table with the SID from the newly created Studio Flow
12. Paste the URLs the URLs for the Agent/Admin view and the End User view into separate brower tabs and start using the conversations demo application!


## Video Tutorials

### [Introduction to DFDP -- What is it and what can it do?](https://youtu.be/Ln-PZgzh2us)

### [Step-by-step DFDP Installtion](https://youtu.be/r-KxNoAKBJI)


## Local Development

If you want to extend any of the client single page applications, you can make changes in client-src/APPNAME/ folders. Edit the file "/client-src/APPNAME/.env.development" with the domain to your Twilio Serverless Service to be able to make http calls from your local machine. You can edit and deploy the Twilio Functions as needed. Run `npm run dev` to run locally, and then `npm run build` to push changes to the /assets folder which you can then deploy using `twilio serverless:deploy`
