# Medallia Conversations Adapter
This project is a reference implementation of a skeleton adapter to receive
and deliver messages with Medallia Conversations. Developed and maintained
as a standalone app in order to leverage the Message Connector API
functionality of Medallia Conversations, it is an example of the red/middle
box in the graphic below.

![Image](docs/assets/CustomAdapter.png)

## Start the adapter service

This project may be run either on a classic host (non-containerized) or
a Docker container.  The two subsections below describe the steps needed
for each.

### Classic host

On a host machine with hostname/IP of <ADAPTER_HOST>, run the following
sequence of commands:

1. `git clone <where ever we host the skeleton>`
2. Set environment variable:
    * `export CONVO_WEBHOOK_URL=<MEDALLIA_CONVERSATION_HOST>/cg/mc/custom/<CHANNEL_GUID>`
      1. For conversations inbound messages
        * `export AUTH_TYPE_INBOUND=<It can be 'Oauth2' or 'Signature'>`
        * `export SHARED_SECRET=<32_CHARACTER_STRING only for Signature>` 
        * `export CONVO_INSTANCE_URL=<MEDALLIA_CONVERSATION_HOST>/oauth/token`
        * `export CLIENT_ID=<CLIENT ID only for Oauth2>` 
        * `export CLIENT_SECRET=<Secret only for Oauth2>` 
      2. For conversations outbound messages
        * `export AUTH_TYPE_OUTBOUND=<It can be 'Oauth2' or 'API-Token'>`
        * `export ACCESS_TOKEN=<STRING that is configured in the channel only for API-Token auth type>`
3. `npm install`
4. `npm start`

This will start a service on port 1338.

### Auth Configuration
For inbound conversations configuration you can setup 2 auth types:
* Signature: This is used to generate signature of the body to send it to Medallia Conversations with the SHARED_SECRET key. In the converation side, under the Signed request auth type, this Secret should match. The string must be 32 characters long. 
* Oauth2: It will use the Conversations OAuth server. You will need the following configuration CONVO_INSTANCE_URL, CLIENT_ID and CLIENT_SECRET.
  * CONVO_INSTANCE_URL: <MEDALLIA_CONVERSATION_HOST>/oauth/token
  * CLIENT_ID: Client ID from Conversation
  * CLIENT_SECRET: Client secret from Conversation

For outbound conversations configuration you can setup 2 auth types:
* API-Token: This method will validate the header/query Token conversation sends against the ACCESS_TOKEN.
* Oauth2: It will use the Client OAuth Server. There is a Test server for this porpouse here and the default configuration you must set up in the conversations side is the following.
  * OAuth2 server URL: http://<ADAPTER_HOST>:1338/token
  * Client ID: ConversationsClient
  * Client secret: S3cr3t123!

All this configurations from the selected methods should match the Conversation's channel Auth settings.

### Docker

On the Docker host system, run the following sequence of commands:

1. Edit [Dockerfile](Dockerfile):
    * Change `<32_CHARACTER_STRING>` to a 32 character string.
    * Change `<MEDALLIA_CONVERSATION_HOST>` to your Medallia Conversations host.
2. `docker build -t skeleton .`
3. `docker run -p 1338:1338  -t skeleton`

This will start a service on port 1338.

## Configure Medallia Conversations

1.  Log in to your Medallia Conversations instance.
2.  Under *Channels*, create a *Custom* channel.
    1.  Set *Custom send message URL* to `http://<ADAPTER_HOST>:1338/custom/me/messages`.
    2.  *Page ID* A unique identification in the conversations system for your adapter.
        * We are using `1234` in this example
    3.  *App ID* `1234`
    4.  Configure inbound and outbound auth settings following the recommendations from "Auth Configuration"
3.  Create a conversation on your instance.
    1.  Add keyword `hello`
    2.  Create a dialog type `statement` with `Hello World!` in the
        `What do you want to say?`.
    3.  Create another dialog with type `Open Question` with `How is your
        day?` in the `What do you want to say?`.
    4.  Click save.

## Test your setup

Call the running adapter:
```
curl -X POST \
  http://<ADAPTER_HOST>:1338/messages/ \
  -H 'Content-Type: application/json' \
  -H 'Cache-Control: no-cache' \
  -d '{
    "consumer_id": "1234user5678",
    "page_id": "1234",
    "text": "hello"
  }'
```

The adapter should return something like the following:

```
Receiving post to skeleton webhook: {"consumer_id":"1234user5678","page_id":"1234","text":"hello"}
sending text message to Convo: {"body":{"object":"page","entry":[{"id":"1234","time":1558473634322,"messaging":[{"sender":{"id":"1234user5678"},"recipient":{"id":"1234"},"timestamp":1558473634322,"message":{"mid":1558473634322,"text":"hello"}}]}]},"url":"https://<MEDALLIA_CONVERSATION_HOST>/cg/mc/custom/<CHANNEL_GUID>"}
response from sendText: OK

/me/messages called with: {"body":{"recipient":{"id":"1234user5678"},"message":{"text":"Hello World!"},"notification_type":"REGULAR"},"access_token":"<env.ACCESS_TOKEN>"}
```

The `hello` text will trigger the conversation configured in
*Configure Conversations* because of the `Add keyword` step.

This sample adapter will respond with something similar to
```
{
	"recipient_id": "1234user5678", // consumer_id in the original curl request
	"message_id": "1234user5678.1558473039324" // A generated id with consumer_id + timestamp
}
```

We highly recommend sending a delivery receipt:

```
curl -X POST \
  http://<ADAPTER_HOST>:1338/deliveries/ \
  -H 'Content-Type: application/json' \
  -H 'Cache-Control: no-cache' \
  -d '{
    "consumer_id": "1234user5678",
    "page_id": "1234",
    "mid": "1234user5678.1558473039324"
  }'
```

The delivery receipt will trigger Conversations to send the next dialog.
In this case, the open question 'How is your day?'.  By default,
Conversations will send the next question after 30 seconds.

The adapter service should log similar to the following:
```
/me/messages called with: {"body":{"recipient":{"id":"1234user5678"},"message":{"quick_replies":[{"title":"Done","content_type":"text","payload":"Done"}],"text":"How is your day?"}},"access_token":"<env.ACCESS_TOKEN>"}
```

Respond to the question `How is your day?` like so:
```
curl -X POST \
  http://<ADAPTER_HOST>:1338/messages/ \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
        "consumer_id": "1234user5678",
        "page_id": "1234",
        "text": "Great!  Thank you!"
}'
```

You may finish the conversation by responding with `done` in place of
`Great!  Thank you!` above.

Congratulations!

## License

Copyright 2020.  Medallia, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.  You may obtain
a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
