/**
 * Move an item from one index to another index in an array.
 * Taken from react-sortable-hoc, but modified to mutate
 * the array instead.
 *
 * Original: https://github.com/clauderic/react-sortable-hoc/blob/master/src/utils.js
 */
export default function arrayMove<T>(array: T[], previousIndex: number, newIndex: number) {
  if (newIndex >= array.length) {
    let k = newIndex - array.length;
    while (k-- + 1) {
      array.push(undefined as any);
    }
  }
  array.splice(newIndex, 0, array.splice(previousIndex, 1)[0]);
  return array;
}
