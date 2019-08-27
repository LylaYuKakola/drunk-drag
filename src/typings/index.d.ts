// @ts-ignore
/**
 * @desc 公用类型集合
 */

export interface PlainObject {
  [key:string]: any,
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

// 在这里区分了element和viewport的输入配置和内部生成的组件porps

// element viewport 公共配置
interface ElementAndViewportConfig {
  w: number,
  h: number,
  x: number,
  y: number,
  id?: string, // 不指定则从内部获取
  style?: any,
  className?: string,
}

// element viewport 组件公共属性（全是内部获取）
interface ElementAndViewportProps extends ElementAndViewportConfig{
  index?: number,
  isSelected?: boolean,
  isViewer?: boolean,
}

// element的配置项
export interface ElementConfig extends ElementAndViewportConfig {
  type?: string, // element 指定cell的内容类型
  actions?: ReducerAction[],
}
// viewport的配置项
export interface ViewportConfig extends ElementAndViewportConfig {
  shape?: string, // viewport 指定cell的形状 @TODO 预备，暂时不实现，默认矩形
}
// element的组件属性
export interface ElementProps extends ElementAndViewportProps, ElementConfig {}
// viewport的组件属性
export interface ViewportProps extends ElementAndViewportProps, ViewportConfig {}

// cell组件属性
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
  noScroll?: boolean,
  onTrigger?: () => void, // @TODO 预留
  id?: string, // 不指定则从内部获取
}

export interface CellsState {
  allElements: ElementConfig[],
  allViewports: ViewportConfig[],
  selectedElements: ElementConfig[],
  selectedViewports: ViewportConfig[],
}

export interface GuideLineProps {
  cellsState: CellsState
  visible:boolean,
  dispatcher: any,
}

export interface DrunkDrag {
  register: any,
  unregister: any,
  getAllTypes: any,
  Editor: any,
  Viewer: any,
}
