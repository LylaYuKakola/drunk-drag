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
}

export interface PagePropsType {
  cells: CellPropsType[],
  height: number,
  width: number,
  onChange?: Function,
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
  activeX:number,
  activeY:number,
  activeW:number,
  activeH:number,
  cells: CellPropsType[],
  selectedCells: CellPropsType[],
  pageW:number,
  pageH:number,
  visible:boolean,
}
