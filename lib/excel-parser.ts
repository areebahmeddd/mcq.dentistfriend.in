// Excel file parsing utility using SheetJS (xlsx library)

export interface ExcelQuestion {
  questionNumber: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
}

export async function parseExcelFile(file: File): Promise<ExcelQuestion[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error("Failed to read file"))
          return
        }

        // Dynamically import xlsx library
        const XLSX = await import("xlsx")

        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Map Excel columns to our Question interface
        const questions: ExcelQuestion[] = jsonData.map((row: any, index: number) => {
          let correctAnswer = (row["Correct Answer"] || row["correctAnswer"] || "").toString().trim().toUpperCase()

          // If the answer is "C. 5 FEET", extract just "C"
          const letterMatch = correctAnswer.match(/^[A-D]/)
          if (letterMatch) {
            correctAnswer = letterMatch[0]
          }

          return {
            questionNumber: row["Question Number"] || row["questionNumber"] || index + 1,
            question: row["Question"] || row["question"] || "",
            optionA: row["Option A"] || row["optionA"] || "",
            optionB: row["Option B"] || row["optionB"] || "",
            optionC: row["Option C"] || row["optionC"] || "",
            optionD: row["Option D"] || row["optionD"] || "",
            correctAnswer: correctAnswer,
            explanation: row["Explanation"] || row["explanation"] || "",
          }
        })

        // Validate questions
        const validQuestions = questions.filter(
          (q) => q.question && q.optionA && q.optionB && q.optionC && q.optionD && q.correctAnswer,
        )

        if (validQuestions.length === 0) {
          reject(new Error("No valid questions found in the file"))
          return
        }

        resolve(validQuestions)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsArrayBuffer(file)
  })
}
