import data from "../../src/data/answers.json";

export function createPracticeAns() {
  const cities = data.filter(({ capital }) => capital === "primary") as City[];
  const practiceAnswer = cities[Math.floor(Math.random() * cities.length)];
  localStorage.setItem("practice", JSON.stringify(practiceAnswer));
  return practiceAnswer;
}

export function getPracticeAns() {
  const ansString = localStorage.getItem("practice");
  let ans: City;
  if (ansString) {
    ans = JSON.parse(ansString);
  } else {
    ans = createPracticeAns();
  }
  return ans;
}
