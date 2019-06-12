/**
 * @desc 公用类型集合
 */

export interface CommonElementPropsType {
  isViewer?: boolean,
}

export interface CellType extends CommonElementPropsType {
  w: number,
  h: number,
  x: number,
  y: number,
  type?: string,
  style?: any,
  isSelected?: boolean,
  index?: number,
  id?: string, // 不指定则从内部获取
  className?: string,
}

export interface EditorType {
  cells: CellType[]|Promise<CellType[]>,
  height: number,
  width: number,
  style: any,
  onChange?: (cells:CellType[]) => void,
  needToolbar?: boolean,
  id?: string, // 不指定则从内部获取
}

export interface ViewerPropsType {
  cells: CellType[]|Promise<CellType[]>,
  height: number,
  width: number,
  style: any,
  id: string,
}

export interface GuideLinePropsType {
  allCells: CellType[],
  selectedCells: CellType[],
  editorW:number,
  editorH:number,
  visible:boolean,
  dispatcher: any,
}

export interface CellsStateType {
  allCells: CellType[],
  selectedCells: CellType[],
}

export interface ReducerPayloadType {
  keys?: string[],
  data?: number[],
  cell?: CellType,
  direction?: string,
  cells?: CellType[],
}

export interface ReducerActionType {
  type: string,
  payload?: ReducerPayloadType,
}

export type MountedFunctionType = (id:string) => void
