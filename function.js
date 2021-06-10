//Define two preset data arrays. one complex one simple.
const testArraySimple = ["()", "()()", "(())", "(()", ")("];
const testArrayComplex = ["({}})", "[]{}[]()()", "([[]()])", "(()[][]][", "({())()})"];

//Define set of brackets to look for.
let checkBrackets = "{([";
//Define the start and end of each brackets
let types = {
  "(": ")",
  "{": "}",
  "[": "]",
};

//Function to check if the brackets are balanced.
isBalanced = (str) => {
  let newArray = [];
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    if (checkBrackets.includes(char)) {
      newArray.push(char);
    } else {
      let last = newArray.pop();
      if (char !== types[last]) return false;
    }
  }
  if (newArray.length !== 0) return false;
  return true;
};

//Loop to run through all cases and tests
for (i in testArraySimple) {
  let result = isBalanced(testArraySimple[i]);
  let subject = testArraySimple[i];
  console.log("subject: " + subject + " - result: " + result);
}

for (i in testArrayComplex) {
  let result = isBalanced(testArrayComplex[i]);
  let subject = testArrayComplex[i];
  console.log("subject: " + subject + " - result: " + result);
}
