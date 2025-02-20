// function bubbleSort(arr) {
//   let n = arr.length;
//   let swapped;

//   do {
//     swapped = false; // ตั้งค่าเป็น false ในแต่ละรอบ
//     for (let i = 0; i < n; i++) {
//       if (arr[i] > arr[i + 1]) {
//         [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
//       }
//     }
//     n--; // ลดขนาดขอบเขตการวนลูปลง เพราะค่าที่มากที่สุดจะอยู่ท้ายสุดแล้ว
//   } while (swapped); // ทำซ้ำจนกว่าจะไม่มีการสลับเกิดขึ้น

//   return arr;
// }

// // ทดสอบฟังก์ชัน
// let numbers = [5, 3, 8, 1, 2];
// console.log(bubbleSort(numbers)); // [1, 2, 3, 5, 8]

let numbers = [5, 3, 8, 1, 2];

const roop = (n) => {
  let swaip = true;
  let array =n.length  //5
  do {
    swaip = false;
    for (let index = 0; index < array.length; index++) {
      if (array[index] > array[index + 1]) {
        //0>1
        [array[index], array[index + 1]] = [array[index + 1], array[index]];
      }
      array--
    }
  } while (swaip);
  return arr;
};
roop(numbers);
