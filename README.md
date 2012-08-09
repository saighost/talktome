# What

A simple chat application to understand how socket.io wroks
First, you have to choose a nickname. Then you can 
* Send message, by writing it in a text field and click on Say.
* Send private message to another user : `@otheruser Hey you<Enter>`
* Get the list of connected user : `/who<Enter>`
* Disconnect from the chat : `/quit<Enter>`
* Get a help message : `/help<Enter>`


# How to install and run it locally

    git clone https://github.com/ymainier/talktome/
    npm install
    npm start

The server will try to listen on port 80. Thus, it will fail to launch if you are already using this port (apache/nginx running ?).
So, you can change the port to 8080 by changing `.listen(80)` to `.listen(8080)` in server.js.