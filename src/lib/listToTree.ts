export type Id = string | number;
export type TreeLeaf<T extends { id: Id; parent_id?: Id | null }> = T & { children: Array<TreeLeaf<T>> };
// need "parentId" in struct of object, return with field "children"
export const listToTree = <T extends { id: Id; parent_id?: Id | null }>(arr: T[]): Array<TreeLeaf<T>> => {
    const tree: Array<TreeLeaf<T>> = [];
    const mappedArr: Record<Id, TreeLeaf<T>> = {};
    let arrElem: T;
    let mappedElem: TreeLeaf<T>;

    // First map the nodes of the array to an object -> create a hash table.
    for (let i = 0, len = arr.length; i < len; i++) {
        arrElem = arr[i];
        const id = arrElem.id;
        const mappedElem: typeof mappedArr[Id] = {
            ...arrElem,
            children: [],
        };
        mappedArr[id] = mappedElem;
    }

    for (const id in mappedArr) {
        if (mappedArr.hasOwnProperty(id)) {
            mappedElem = mappedArr[id];
            // If the element is not at the root level, add it to its parent array of children.
            if (mappedElem.parent_id && mappedArr[mappedElem.parent_id]) {
                mappedArr[mappedElem.parent_id].children.push(mappedElem);
            }
            // If the element is at the root level, add it to first level elements array.
            else {
                // @ts-ignore
                tree.push(mappedElem);
            }
        }
    }
    return tree;
};
