# Better Wordle Solver

## Description:
Better wordle solver is an application which shows the user the possible words for Wordle's based on the feedback the user provides the algorithm with based of previous guesses.

## How to use it:

Step 1: The user will guess a random 5-letter word in Wordle, such as "AUDIO".

Result: After entering the word "AUDIO" the user will see some letters turn gray, yellow, or green. 

Step 2: 
If there are any green letters, the user will enter then in their respective position in the Better Wordle Solver application.
If any letters turn yellow, the user will click "+ Add Yellow Letter" then they will enter the letter, and finally click on the position(s) it was yellow.
If any letters turn gray, then the user will enter that letter at the bottom in the boxes for gray letters.

Result: The application will use it's algorithm to filter out words and show all the possible words.

Step 3: The user will use one of the possible words and then repeat the cycle until they get the correct word.

Result: The wordle has been solved. Yay!

## How it's different from other wordle solvers:

Unlike other wordle solvers, mine has a special feature for yellow letters. The user the select the positions where a certain letter is yellow. This way the algorithm will not show the words with the yellow letters in positions it cannot be in. So far, this feature has not been in any other wordle solver that I have used and it was the reason I built this project.

## How I built it:

I found a list with 8000+ possible wordle guesses and then created a json database with all those words. Then I built a filtering algorithm in JavaScript using for loops and if statements which filter out the words.

## Try the app using this link:

https://betterwordlesolver.netlify.app/
