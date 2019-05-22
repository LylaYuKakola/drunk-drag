export interface PlainObjectType {
  [propertyName:string]: any
}

export interface CommonElementPropsType {
  isPurePage?: boolean,
  contentProps?: any,
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
  cells: CellType[],
  height: number,
  width: number,
  style: any,
  onChange?: (cells:CellType[]) => void,
  needToolbar?: boolean,
  id?: string, // 不指定则从内部获取
}

export interface ExportedPagePropsType {
  cells: CellType[],
  height: number,
  width: number,
  isSingleScreen: boolean,
  id: string,
}

export interface GuideLinePropsType {
  allCells: CellType[],
  selectedCells: CellType[],
  pageW:number,
  pageH:number,
  visible:boolean,
}

export interface CellsStateType {
  allCells: CellType[],
  selectedCells: CellType[],
}

export interface ReducerActionType {
  type: string,
  payload?: {
    keys?: string[],
    data?: number[],
    cell?: CellType,
    direction?: string,
  }
}
