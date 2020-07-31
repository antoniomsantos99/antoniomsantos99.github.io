---
layout:     post
title:      Coding Quests - Making a Simple Bot
date:       2020-07-30 00:00:01
author:     António Santos
summary:    Making a minecraft bot step by step
categories: Coding
thumbnail:  book
tags:
 - Coding
 - Bot
 - Python
 - Minecraft
---

# Introduction

Hello people!

Recently i have been interested in automating the most tedious tasks of my daily life (in part due to my laziness) and since i am on summer break that means **GAMING**. We can do that by creating a program that can interact directly or indirectly (more on that later) with our game and using it to automate an action or chain of actions there. We call these programs **BOTS**.

Bots are generally frown upon with the gaming community since it can be argued that it gives you an unfair advantage over other players. With that said i decided to use python to create a fishing bot for **Minecraft** where i can use it in a friend of mine's server where he allowed me to use it.

## Step 1 - Plan it out!

So first of all we need to see how fishing in minecraft actually works so let's check that!
![Minecraft Fishing](https://raw.githubusercontent.com/antoniomsantos99/antoniomsantos99.github.io/master/assets/CodingQuests/1/1.gif)


By analysing the gif we can conclude that the time it takes for a fish to appear is random so i cannot make a simple script that reels the line and rethrows it every X seconds and it would be really hard to make a bot that tracked the fishing bob movement to detect if a fish had bitten. I was stumped until a remembered a game-changing featured in Minecraft. The **subtitles**. With the feature enabled the game looks like this:
![Minecraft Fishing with Subtitles](https://raw.githubusercontent.com/antoniomsantos99/antoniomsantos99.github.io/master/assets/CodingQuests/1/2.gif)

We can see now that when a fish bites the game prints "Fishing Bobber splashes" on the bottom right of the window and we can use it to know when to reel the line. To do that we can make a bot that captures our screen and processes the image to find out if the game had printed the line that we want!

So let's make a list of the stuff to do:

 1. Capturing the screen 
 2. Analyze the information in the screen
 3. Emulating the actions

## Step 2 - Time for some coding!
### Step 2.1 Capturing the screen
Capturing the screen using python from scratch is not an easy task however we can use a cool python library called **PIL** [(Python Imaging Library)](https://pypi.org/project/Pillow/) which contains a class called **ImageGrab** that does exactly what we want, so let's make use of it using the following piece of code!
```Python
import numpy as np  
from PIL import ImageGrab  
import cv2  
import time  

while True:
  last_time = time.time()    
  screen = (np.array(ImageGrab.grab(bbox=(0, 0, 1920, 1080))))  
  print('Frame took {} seconds'.format(time.time() - last_time))  
  cv2.imshow('window', screen)
```
This piece of code continuously captures my monitor, mirrors it and checks how long it takes to capture it. This is how it looks when it's ran:
![What bot sees](https://raw.githubusercontent.com/antoniomsantos99/antoniomsantos99.github.io/master/assets/CodingQuests/1/3.gif)


So, we can clearly see that the colors are all off! Why? That's because PIL actually captures the image with BGR (Blue Green Red) values instead of RGB (Red Green Blue). Now, should we convert it to RGB? The coloring of the image isn't important for our bot so converting every single image that is captured would be an unnecessary and wasteful task! 
We can also see that each frame takes about 0.08 seconds which means that our Bot sees our game at about 12 FPS which is an acceptable rate.
Finally we see that we actually don't need our whole monitor for the bot to work, we only need to check the bottom right of our game to read the subtitles. So we can decrease the area that our bot captures which makes our bot use less resources and actually makes it easier to analyses the information since we only capture the useful area!

Now, while we reduced the amount of useless information that our bot receives the game background behind the subtitles can actually cause us some problems so let's remove it!

```Python
thresh = cv2.threshold(screen, 140, 255, cv2.THRESH_BINARY)[1]
```
This line uses the threshold function from [OpenCV2](https://pypi.org/project/opencv-python/) which converts all the pixels in a picture below an assigned value to black and the rest to white. Currently our code looks like:

```Python
import numpy as np  
from PIL import ImageGrab  
import cv2  
import time  

while True:
  last_time = time.time()    
  screen = (np.array(ImageGrab.grab(bbox=(1650, 920, 1920, 1010))))
  thresh = cv2.threshold(screen, 140, 255, cv2.THRESH_BINARY)[1]  
  print('Frame took {} seconds'.format(time.time() - last_time))  
  cv2.imshow('window', thresh)
```
And the result is:
![Comparison between game and what bot sees](https://raw.githubusercontent.com/antoniomsantos99/antoniomsantos99.github.io/master/assets/CodingQuests/1/1.png)


Seems like we finished the first step! Onto the next one!!

### Step 2.1 Analyzing the information in the screen
Now that we have gathered all the information we need we can start analyzing it! We could do this in 2 ways:

 1. Comparing the pictures taken with one of the case where we want to act and if both are equal then perform the actions.
 2. Reading what is actually in the subtitles and acting according to it.

The first way is the most performant one since we only have to subtract both images and check if the result is a plain black picture however since the subtitles are dynamic the chance of this method actually working consistently would be next to null so let's use the second way!

![Image subtraction example](https://docs.opencv.org/3.4/Background_Subtraction_Tutorial_Scheme.png)
To read the text on the images we will use a technology called OCR ([Optical character recognition](https://en.wikipedia.org/wiki/Optical_character_recognition)) and to use that we will use the Python library called **Pytesseract** which is a wrapper for [Google's Tesseract-OCR Engine](https://github.com/tesseract-ocr/tesseract). Once we have the engine properly installed reading the image is as easy as adding:
```Python
text = pytesseract.image_to_string(thresh)
```
Our code looks like this:

```Python
import numpy as np  
from PIL import ImageGrab  
import cv2  
import time

pytesseract.pytesseract.tesseract_cmd = 'PATH TO TESSERACT'

while True:
  last_time = time.time()    
  screen = (np.array(ImageGrab.grab(bbox=(1650, 920, 1920, 1010))))
  thresh = cv2.threshold(screen, 140, 255, cv2.THRESH_BINARY)[1]
  print(pytesseract.image_to_string(thresh))  
  print('Frame took {} seconds'.format(time.time() - last_time))  
  cv2.imshow('window', thresh)
```
And this is what we get:
![OCR in action](https://raw.githubusercontent.com/antoniomsantos99/antoniomsantos99.github.io/master/assets/CodingQuests/1/4.gif)


So, our time per frame increased by a bunch and our bot reads mostly gibberish which makes it seem like our project goes nowhere but as we saw our bot can read the  *"eae Bais) see ea"* when a fish bites consistently which, well... Works in our favor since we don't need the bot to read the actual words, we just need the bot to know when to reel the fishing line. We just need to make the bot act when it reads *"eae Bais) see ea"*.

We can also remove the time per frame and the window to see what the Bot sees since we wont tweak that part anymore!

```Python
import numpy as np  
from PIL import ImageGrab  
import cv2  

pytesseract.pytesseract.tesseract_cmd = 'PATH TO TESSERACT'

while True:  
  screen = (np.array(ImageGrab.grab(bbox=(1650, 920, 1920, 1010))))
  thresh = cv2.threshold(screen, 140, 255, cv2.THRESH_BINARY)[1]
  if "eae Bais) see ea" in pytesseract.image_to_string(thresh)):
	  #Bot does stuff here  
```

Now we just need to emulate our bot actions. Onto the next step!

### Step 2.3 Emulating the actions
Since our bot is pretty basic this part is actually the easiest part! We just need to make the bot press right-click when a fish bites to reel the line and press it again some time later to rethrow it! To make our bot press right-click we are going to use one last library called [PyAutoGui](https://pypi.org/project/PyAutoGUI/) which enables us to do all kind stuff involving virtual input!
To make it right-click we just need to write the following line: 
```Python
pyautogui.rightClick()
```
Now we add it to our code along with some a misc item counter:

```Python
import numpy as np  
from PIL import ImageGrab  
import cv2
import time  

pytesseract.pytesseract.tesseract_cmd = 'PATH TO TESSERACT'

items = 0
while True:
  screen = (np.array(ImageGrab.grab(bbox=(1650, 920, 1920, 1010))))
  thresh = cv2.threshold(screen, 140, 255, cv2.THRESH_BINARY)[1]
  if "eae Bais) see ea" in pytesseract.image_to_string(thresh):
    items+=1
    pyautogui.rightClick()
    print("Caught {} items!".format(i))
    time.sleep(1.5)
    pyautogui.rightClick()

```

And our code is pretty much done! You can use this code to fish automatically but you might need to tweak some stuff like the dimensions of the area your bot captures or the text needed for the bot to act.


## Step 3 Enjoying our bot!

Now that the bot is done we can finally use it!

Here's the bot in action:
![Bot in action](https://raw.githubusercontent.com/antoniomsantos99/antoniomsantos99.github.io/master/assets/CodingQuests/1/5.gif)


In the future i might add some extra features to upgrade the bot but for now this is more than enough.

Thanks for reading!!