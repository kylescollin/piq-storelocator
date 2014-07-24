PlaceIQ Store Locator
=====================

DESCRIPTION
-----------
This is a store locator mobile website, ideally served as a mobile ad. It has a fixed size of 640x840px, which translates to 320x420px size for non-retina phones. This will pull in a map of locations based on a Google Maps search term.


USER FLOW
---------
Users land on the site and are able to choose to either share their "current location" or a "custom location." If they choose the latter they can type in a city, state or zip code. The map is populated with store locations. The user can tap on any of the store locations to see the name and the address. Users can then click to call the store, or click for directions.


HOW TO UPDATE
-------------
1. Replace all of the necessary graphic files (footer.png, header.png, load.png, map.png, phone.png, pin.png). If the file names have changed, update them in index.html and at the top of js/style.js.
2. At the top of js/style.js, change the storeName variable to the Google Maps search term you want to have populate the map.
3. Update the top of styles.less - change the header and footer height variables to reflect the size of the graphics, change the color of the location choice buttons, and update the location details colors.
4. Make sure to compile the .less file into a .css file
5. Update the Google Analytics UA code in the js/ga.js file.
