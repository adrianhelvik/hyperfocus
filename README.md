# Hyperfocus

The purpose of this tool is to provide a rapid way of managing tasks.

## Running in Docker
1. Install Docker and Docker Compose (usually bundled with Docker)
2. Run `./start` in the root folder.
3. Open http://localhost:9341 in your web browser

## Demo usage
1. Click login and enter test / secret
2. Create two boards (eg. "Design" and "Development")
3. Open the "Development" board
4. Create the decks "Design finished", "Doing" and "Done"
5. Open the "Design" board
6. Create the decks "To do" and "Doing"
7. Create a portal named "To development"
  1. Select the board "Development"
  2. Select the deck "Design finished"
8. The deck "Design finished" will now be shared between "Design" and "Development"
