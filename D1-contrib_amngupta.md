# TEST PASS RATE: 
# COVER RATE: 

## Contributions
- Made test cases for the complete deliverable
- Made the interface for `courseRecords` and `QueryEngine` [c1fb4d9] (https://github.com/CS310-2017Jan/cpsc310project_team114/commit/c1fb4d9)   [79c5205] (https://github.com/CS310-2017Jan/cpsc310project_team114/commit/79c5205) 
- Made the `performQuery` functionality
  - Created recursive function `runForFilter` which calls different funtions depending on the comparitor [485024a]  (https://github.com/CS310-2017Jan/cpsc310project_team114/commit/485024a) 
  - Created function `runForOptions` which alters the table to the specified options in the query request [d054391] (https://github.com/CS310-2017Jan/cpsc310project_team114/commit/d054391) 
  - The `performQuery` functionality also uses `checkColumnIsValid` function to ensure the column is valid [08a369f] (https://github.com/CS310-2017Jan/cpsc310project_team114/commit/08a369f) 
- Contributed to `addDataset` funtion [bf89960] (https://github.com/CS310-2017Jan/cpsc310project_team114/commit/bf89960) 
  - Created `loadFromFile` function that parses the raw data into the specified format 
  - Helped fixing `parseData` function that parses the base64 String into a file

## Retrospective
I believe although we made significant progress in the beginning of the deliverable, during the 2nd and 3rd week we 
did not put in enough effort. Moreover, we should have started testing with the AutoTest sooner as during the last few 
days, we faced several issues with figuring out why the autoBot is timing out on our code despite running smoothly on our local
machines. With hindsight, for the next deliverable, I will want to do more testing with the AutoBot from the beginning to 
figure out what could be the possible issues. 
