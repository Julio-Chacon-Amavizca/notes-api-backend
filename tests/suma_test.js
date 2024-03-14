const suma = (a, b) => {
  return a + b
}

const check = [
  { a: 0, b: 0, result: 0 },
  { a: 1, b: 3, result: 4 },
  { a: -3, b: 3, result: 0 }
]

check.forEach((check, index) => {
  const { a, b, result } = check
  console.assert(
    suma(a, b) === result,
        `la suma de ${a} y ${b} deberia de ser ${result}`
  )
})

console.log(`${check.length} checks realizados!`)
