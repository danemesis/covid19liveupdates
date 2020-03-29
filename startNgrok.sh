#!binbash

#starting ngrok translation of the port 3000
# ngrok http 3000

# recieving local ngrok configuration
ngrokConfig=$(curl http://127.0.0.1:4040/api/tunnels)

ngrok_url=$(echo $ngrokConfig | grep -Po '"public_url":"(https.*?[^\\])",' | grep -Po "https:.*(?=\")")

#startingServer
echo $ngrok_url 