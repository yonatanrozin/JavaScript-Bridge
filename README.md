# JavaScript Bridge

__Currently in development - functionality NOT guaranteed!__

_Docs in progress_

A simple program that runs static HTML/JavaScript files as full-screen desktop applications and enables TCP/IP-based communication protocols for new networking possibilities.

![](https://yonatanrozin.com/wp-content/uploads/2026/06/IMG_8374-1-2.gif)

Read more about the project [here](https://yonatanrozin.com/project/osc-bridge/).

## Installation

- Tested and functional on Windows 11
- Functional on MacOS Sequoia - __Camera functionality currently NOT functional__

### Option 1 - download installer

Tested on Windows 11, functional on Mac but needs testing

- Download and install latest [release](https://github.com/yonatanrozin/OSC-Bridge/releases)
  - Opening installed app for the first time may show security warning on Mac computers. After receiving warning, allow permission in "Privacy & Security" section of computer system preferences.
 
### Option 2 - build from source

Requires [Node.js](https://nodejs.org/en/download) installed

- Clone this repository or download and extract .zip file
- In new terminal window, from repository folder:
  - ```npm install```
  - ```npm run build``` (takes 1-2 minutes)
  - Find newly-built installer in ```/dist``` folder
  - __This will replace your existing installer!__ See below for instructions on compiling multiple apps.

#### Building multiple apps

To build multiple apps (eg. to manage several concurrent projects), each app must be given a unique "product name":

- Before running ```npm run build``` in the instructions above, update your ```package.json``` file:
  - ```name```: set to something unique - must contain only lowercase numbers, letters and underscores
  - ```build.productName```: enter the name you'd like to use for the appliaction
  - ```build.appId```: set to something unique - convention is ```com.example.<name>```

## Usage

- Modify files in ```<app_contents>/sketch``` 
  - See API notes below for sending/receiving OSC messages within your sketch
- Launch osc_bridge app
- Use ```ctrl-E``` to open sketch files folder in file browser for easy location
  - __Editing these files while app is running will refresh the sketch!__
- Use ```ctrl-F``` to toggle fullscreen
- Use ```ctrl-R``` to refresh page
- Use ```ctrl-I``` to show a pop-up with your computer's local IP address. Use this IP address when sending messages to this device over your local network!

### Offline usage

It may be beneficial or necessary to run a program on this app without internet connection. When doing so, ensure that any scripts loaded over the internet (usually in the head of an html file) are instead downloaded, placed in the sketch folder and referenced locally. It's recommended to use minified versions of script files when possible.

For example, most of the provided code examples use p5.js, which is fetched by the html file with ```<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>```. To run the examples offline, the file should be downloaded (visit the https link in a web browser and save the file) and placed in the sketch folder, and the above line in the html should be replaced with ```<script src="./p5.js"></script>```.

Naturally, any javascript functions that fetch data over the internet will not work offline.

## API

__This API is only available within the bridge application context. It is NOT available within the web browser!__

### OSC

OSC is a message syntax that allows labeled datapoints to be sent between devices and programs over a local WiFi or ethernet network. Most real-time multimedia programs are OSC-compatible.

#### Sending OSC

To send OSC messages from your sketch: ```Bridge.OSC.send(<data>, <IP_Addr>, <port>)```
- ```<data>``` - a JavaScript object whose keys are OSC addresses and corresponding values are arrays of arguments, i.e. ```{"\position" : [1, 2, 3]}```
  - Be sure to include the leading ```/``` in all OSC addresses!
  - Array arguments can be numbers, strings or booleans (will be converted to ints: 0 or 1)
  - An object with one key/value pair will be sent as a message. Object with multiple key/value pairs are sent as an OSC bundle.
- ```<IP_Addr>``` & ```<port>``` (optional) - destination IP address and port for the OSC message.

#### Receiving OSC

- Create an OSC message handler with ```Bridge.OSC.begin(<port>)```
  - ```<port>``` - the OSC port # to receive messages on
- Use ```<handler>.route(<address>, <handler>)``` to handle incoming OSC messages 
  - ```<address>``` - OSC address to route
    - Use ```*``` as a single-level wildcard (e.g. ```/*/temperature``` will match addresses ```/device1/temperature```, ```/anything/temperature```, etc.)
  - ```<handler>``` - a callback function with up to 2 arguments: ```(<args>, <address>)```
    - ```<args>``` - an array of OSC message arguments (numbers or strings)
    - ```<address>``` - the complete OSC message address

Send OSC messages to this device using the device's IP address and the port # used above. Use ```CTRL-I``` to show a pop-up with your device's current local IP address, or get it as a JavaScript string using ```Bridge.localIP```

### Serial

Serial communication allows bytes of data to be sent between your application and another device through a wired USB connection.

#### Connecting to a Serial port

- Use ```Bridge.Serial.list()``` to return a Promise that resolves to an object containing the names and paths of available USB serial ports
  - Object keys are serial port paths, object values are corresponding human-readable device names
- Get a serial port handler object using ```Bridge.Serial.get(<path>)```, where ```<path>``` is the path to the serial port (should be an existing object key returned by ```Bridge.Serial.list()```)
  - Beware! This function returns an object even if the path doesn't refer to an available serial port. Attempting to open an invalid serial port will cause an error.
- Begin serial communication using ```<handler>.begin(<baudRate>)``` and your desired baudrate, defaulting to 9600. End the communication using ```<handler>.close()```.

#### Receiving Serial messages
- Use ```<handler>.onData(<callback>)``` to handle incoming serial data.
  - ```<callback>```: a function that takes up to 2 arguments: ```<data>, <buffer>```
    - ```<data>```: the message contents as a string, stripped of any leading/trailing whitespace
    - ```<buffer>```: an array of message byte values (not stripped of whitespace but does NOT include the ```\r``` delimiter)

#### Sending Serial messages
- Use ```<handler>.send(<data>)``` to send data through the serial port
  - ```<data>```: the data to send. Can be either a string, number or array of numbers.
    - Strings will be ascii-encoded
    - Numbers or arrays of numbers will be sent as raw byte values. To send a string representation of a number, i.e. "50", use ```String(<data>)``` instead.

### Art-net

Art-net is a communication standard for sending lighting cues over a local WiFi or ethernet network.

#### Sending Art-net

- Use ```Bridge.ArtNet.send(<data>, <universe>, <startChannel>, <host>, <port>)```
  - ```<data>```: an array of channel values, usually used for RGB color data.
    - Channel values are either ints 0-255, but can also be ```null``` to avoid updating that specific channel value on the receiving end.
  - ```<universe>```: the Art-net "universe" to send the data to. Default 0, but some receivers may be expecting universe #1 by default instead.
    - Each universe can hold up to 512 channels. If you need more than 512 channels you should use multiple universes.
  - ```<startChannel>```: the channel number the first value in ```<data>``` should be sent to. Each subsequent data value will be sent to the next channel number. Default is channel 1.
  - ```<host>```: the IP address of the receiver device. Default is ```255.255.255.255```, the UDP broadcast address which will send the message to ALL devices on your network.
  - ```<port>```: the port the receiver device is listening for messages on. Default is Art-net port 6454.

## Examples

__The Zig Sim mobile app (which most of the examples below use) was recently updated, including changes to the message OSC addresses. Be sure you are using the latest version of the Zig Sim app. The etch-a-sketch example is currently not working following the update. Fix coming soon! Rest of examples are functional.__

See sketch examples [here](https://github.com/yonatanrozin/OSC-Bridge/blob/main/examples)

To try out an example sketch, copy the sketch files into the application sketch folder
- Launch app and enter Ctrl-E (or cmd-E) to open the application sketch folder.
- __Copy the example sketch files only - NOT the entire folder!__

Example sketches are designed to work with free Zig Sim app on iOS and Android. _Zig Sim Pro uses different OSC addresses and will require adjustments to the sketch OSC routes._
- Ensure smartphone and computer are on the same WiFi network
- In Zig Sim "sensors" tab 
  - Enable required hardware data streams
  - See below for specific required sensors per example
- Zig Sim "settings" tab
  - Select ```other app``` destination, ```UDP``` protocol and ```OSC``` message format
  - Enter computer's local IP address and port 4242
  - Select frame rate (30 or 60 recommended)
- Enter "start" tab to begin - smartphone must stay on with the Zig Sim app open!

### OSC + Serial Message Log (default sketch)
- Displays all incoming OSC message addresses + arguments and serial data in an on-screen table
- See headers at top for computer's IP address. Use this IP address and port 4242 to send OSC messages to the sketch (from Zig Sim or other source)

### Etch-a-sketch
- Enable Zig Sim "2D Touch", "Accel" and "Touch Radius" sensors
- Touch phone screen to draw on the computer canvas. Press harder for thicker lines.
- Shake the phone to clear the canvas!

### Fruit Ninja
- Enable Zig Sim "2D Touch", "Gravity" and "Compass" sensors
- Point phone at computer/monitor and tap phone screen to calibrate pointer
- Slice fruit with the orientation sensor!

### Jump!
- Enable Zig Sim "accel" sensor
- Place phone in pocket with upper edge facing UP
- Jump to avoid the obstacles!

### Steering
- Enable Zig Sim "gyroscope" and "gravity" sensors
- Hold phone horizontally, top of phone facing left, with the touchscreen facing you
- Steer left and right to stay on the winding road!
- Tilt the phone towards/away from you to speed up and slow down.

### ML5 Pinch
- Does not use Zig Sim. Ensure computer has internet and camera access.
- Pinch the on-screen slider with a thumb and index finger to move it!
- Sketch will send OSC messages with the ```/slider``` address and slider position when moved.
  - Edit line 53 of sketch.js to set OSC destination (default is ```localhost``` port ```4243```)
    - i.e. ```OSC.send(`/slider`, pinch_location[0], "12,34,56,78", 7000);```

## License
This software is distributed under the MIT license. Feel free to use it but please do leave appropriate credit, especially in any online materials related to your project!
