// 公共的type和interface

export interface PlainObjectType {
  [propertyName:string]: any
}

export interface CommonElementPropsType {
  isPurePage?: boolean,
  contentProps?: any,
}

export interface FlexBlockPropsType extends CommonElementPropsType {}

export interface CellPropsType extends CommonElementPropsType {
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

export interface PagePropsType {
  cells: CellPropsType[],
  height: number,
  width: number,
  style: any,
  onChange?: (cells:CellPropsType[]) => void,
  needToolbar?: boolean,
  id?: string,
}

export interface ExportedPagePropsType {
  cells: CellPropsType[],
  height: number,
  width: number,
  isSingleScreen: boolean,
  id: string,
}

export interface GuideLinePropsType {
  allCells: CellPropsType[],
  selectedCells: CellPropsType[],
  pageW:number,
  pageH:number,
  visible:boolean,
}

export interface StateOfReducerType {
  allCells: CellPropsType[],
  selectedCells: CellPropsType[],
}

export interface ActionOfReducerType {
  type: string,
  payload?: {
    key?: string,
    keys?: string[],
    data?: number[],
    cell?: CellPropsType,
    direction?: string,
  }
}
