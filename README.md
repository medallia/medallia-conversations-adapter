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
2. Set environment variable
    * `export CONVO_API_GATEWAY=https://<MEDALLIA_CONVERSATIONS_HOST>`
    * `export CHANNEL_GUID=<Channel GUID>`
    * `export DEFAULT_OAUTH_EXPIRES_SECS=<OAuth expiration time in sec>`
      1. For communicating from the channel adapter to Medallia Conversations,
        * `export CLIENT_ID=<CLIENT ID for OAuth>` 
        * `export CLIENT_SECRET=<Secret for OAuth>`
      2. For communicating from Medallia Conversations to the channel adapter,
        * `export AUTH_TYPE_OUTBOUND=<It can be 'OAuth' or 'API-Token'>`
        * `export ACCESS_TOKEN=<STRING that is configured in the channel only for API-Token authentication type>`
3. `npm install`
4. `npm start`

This will start a service on port 1338.

### Authentication Configuration

For communicating from the channel adapter to Medallia Conversations,
* OAuth: It will use the Conversations OAuth server. 
You will need the following configuration CLIENT_ID and CLIENT_SECRET environment variables
matching the ones from the Conversations Channel configuration,
  * Client ID: Client ID from Conversations for OAuth
  * Client secret: Client secret from Conversations for OAuth

For communicating from Medallia Conversations to the channel adapter
set the AUTH_TYPE_OUTBOUND to one of the following options,
* API-Token: This method will validate the header/query Token conversations sends against the ACCESS_TOKEN.
* OAuth: Authenticates with the client's OAuth 2.0 server using a client credentials grant.
Complete these configurations in the Conversations channel with the default values
  * OAuth server URL: http://<ADAPTER_HOST>:1338/token
  * Client ID: ConversationsClient
  * Client secret: S3cr3t123!

### Docker

On the Docker host system, run the following sequence of commands,
1. Edit [Dockerfile](Dockerfile):
    * Change `<MEDALLIA_CONVERSATIONS_HOST>` to your Medallia Conversations host.
    * Change `<CHANNEL_GUID>` to your Medallia Conversations channel GUID.
    * Change `<CLIENT_ID>` to your Medallia Conversations channel client ID.
    * Change `<CLIENT_SECRET>` to your Medallia Conversations channel secret.
    * Change `<AUTH_TYPE_OUTBOUND>` to 'API-Token' or 'OAuth'.
    * Change `<ACCESS_TOKEN>` to your token if you are using API-Token.
    * Change `<DEFAULT_OAUTH_EXPIRES_SECS>` to the default OAuth Expire time in secs.
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
    4.  Configure inbound and outbound authentication settings following the recommendations 
    from [Authentication Configuration](#Authentication Configuration)
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
sending text message to Convo: {"body":{"object":"page","entry":[{"id":"1234","time":1558473634322,"messaging":[{"sender":{"id":"1234user5678"},"recipient":{"id":"1234"},"timestamp":1558473634322,"message":{"mid":1558473634322,"text":"hello"}}]}]},"url":"https://<MEDALLIA_CONVERSATIONS_HOST>/cg/mc/custom/<CHANNEL_GUID>"}
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
