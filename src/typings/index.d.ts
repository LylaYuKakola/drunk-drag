// @ts-ignore
/**
 * @desc 公用类型集合
 */

export interface PlainObjectType {
  [key:string]: any,
}

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

export interface BasicViewerPropsType {
  cells: CellType[]|Promise<CellType[]>,
  height?: number,
  width?: number,
  style: any,
  id: string,
}

export interface AdaptiveViewerPropsType extends BasicViewerPropsType{
  noScroll?: boolean,
}

export interface ViewportViewerPropsType extends BasicViewerPropsType{
  viewportHeight?: number,
  viewportWidth?: number,
  panelTop: number,
  panelLeft: number,
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
  initializing: boolean,
  wrongInitialized: boolean,
}

export interface ReducerPayloadType {
  keys?: string[],
  data?: number[],
  cell?: CellType,
  direction?: string,
  cells?: CellType[],
  wrong?: boolean,
}

export interface ReducerActionType {
  type: string,
  payload?: ReducerPayloadType,
}

export type MountedFunctionType = (id:string) => void

export interface DrunkDragType {
  register: any,
  unregister: any,
  getAllTypes: any,
  Editor: any,
  Viewer: any,
}
