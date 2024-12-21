type BmiClassification = "Underweight" | "Normal" | "Overweight" | "Obese";

export default function getBmiClassification(bmi: number): BmiClassification {
  if (bmi < 18.5) {
    return "Underweight";
  } else if (bmi < 25) {
    return "Normal";
  } else if (bmi < 30) {
    return "Overweight";
  } else {
    return "Obese";
  }
}
