// @ts-ignore
/**
 * @desc 公用类型集合
 */

export interface PlainObject {
  [key:string]: any,
}

interface ElementAndViewportProps {
  w: number,
  h: number,
  x: number,
  y: number,
  id?: string, // 不指定则从内部获取
  style?: any,
  className?: string,
  index?: number, // 内部获取
  isSelected?: boolean, // 内部获取
  isViewer?: boolean, // 内部获取
}

export interface ElementProps extends ElementAndViewportProps {
  type?: string, // tag为'element'的时候，指定cell的内容
}

export interface ViewportProps extends ElementAndViewportProps {
  shape?: string, // tag为'viewport'的时候，指定cell的形状 @TODO 预备，暂时不实现，默认矩形
}

export interface CellProps {
  w: number,
  h: number,
  x: number,
  y: number,
  id: string,
  content: any,
  borderVisible: boolean,
  zIndex: number,
  style?: any,
  containerExtraStyle?: any,
}

export interface EditorProps {
  elements: ElementProps[],
  viewports: ViewportProps[],
  height: number,
  width: number,
  style: any,
  onChange?: (cellsState:CellsState) => void,
  id?: string, // 不指定则从内部获取
}

export interface ViewerProps {
  elements: ElementProps[],
  viewports: ViewportProps[],
  height: number,
  width: number,
  style: any,
  onTrigger?: () => void, // @TODO 预留
  id?: string, // 不指定则从内部获取
}

export interface CellsState {
  allElements: ElementProps[],
  allViewports: ViewportProps[],
  selectedElements: ElementProps[],
  selectedViewports: ViewportProps[],
  loading: boolean, // @TODO 暂时没用
  loadedWithError: boolean, // @TODO 这个字段用来处理异步错误
}

export interface GuideLineProps {
  cellsState: CellsState
  visible:boolean,
  dispatcher: any,
}

export interface ReducerPayload {
  tag: string, // 'element' | 'viewport', 必须的
  ids?: string[], // 指定cell的ID进行操作 (不区分 element 和 viewport)
  data?: any, // 操作的数据
}

export interface ReducerAction {
  type: string,
  payload?: ReducerPayload,
}

export interface DrunkDrag {
  register: any,
  unregister: any,
  getAllTypes: any,
  Editor: any,
  Viewer: any,
}
