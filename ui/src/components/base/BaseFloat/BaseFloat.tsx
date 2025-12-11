import React, {
  useState,
  Children,
  cloneElement,
  type ForwardedRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  useFloating,
  FloatingPortal,
  offset,
  flip,
  autoUpdate,
  type Strategy,
  size,
  useClick,
  useDismiss,
  useInteractions,
  useRole,
  FloatingFocusManager,
  type UseFloatingReturn,
} from "@floating-ui/react";
import { Transition } from "@headlessui/react";

// 完善类型定义，移除任意类型
export interface FloatProps {
  children: React.ReactNode;
  contentAsChild?: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  offset?: number;
  strategy?: Strategy;
  placement?: UseFloatingReturn["placement"];
  adaptiveWidth?: boolean;
  zIndex?: number;
  fixed?: boolean;
  open?: boolean; // 外部可控状态
  onOpenChange?: (open: boolean) => void; // 状态变化回调
  modal?: boolean; // 是否为模态框（聚焦锁定）
  composable?: boolean; // 支持 composable 选项
}

interface FloatComponent extends React.FC<FloatProps> {
  Reference: React.ForwardRefExoticComponent<
    {
      children: React.ReactNode;
    } & React.RefAttributes<HTMLElement>
  >;
  Content: React.ForwardRefExoticComponent<
    {
      children: React.ReactNode;
      className?: string;
      style?: React.CSSProperties;
    } & React.RefAttributes<HTMLElement>
  >;
}

const Float: FloatComponent = ({
  children,
  contentAsChild = false,
  enter = "transition duration-100 ease-out",
  enterFrom = "opacity-0 scale-95",
  enterTo = "opacity-100 scale-100",
  leave = "transition duration-75 ease-out",
  leaveFrom = "opacity-100 scale-100",
  leaveTo = "opacity-0 scale-95",
  offset: offsetProp = 5,
  strategy: strategyProp = "absolute",
  placement = "bottom-start",
  adaptiveWidth = false,
  zIndex = 200,
  fixed = false,
  open: controlledOpen, // 外部可控状态
  onOpenChange: controlledOnOpenChange,
  modal = false,
}) => {
  // 内部状态 + 外部受控状态兼容
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = (newOpen: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  // 初始化 Floating UI，添加自适应宽度 middleware
  const {
    refs,
    floatingStyles,
    context,
    update,
    middlewareData: { size: sizeData },
  } = useFloating({
    open,
    onOpenChange,
    placement,
    strategy: fixed ? "fixed" : strategyProp,
    middleware: useMemo(
      () =>
        [
          offset(offsetProp),
          flip(),
          // 实现自适应宽度
          adaptiveWidth &&
            size({
              apply({ elements, rects }) {
                Object.assign(elements.floating.style, {
                  width: `${rects.reference.width}px`,
                  minWidth: "unset", // 覆盖默认最小宽度
                });
              },
            }),
        ].filter(Boolean),
      [offsetProp, adaptiveWidth],
    ),
    whileElementsMounted: autoUpdate,
  });

  // 完善交互逻辑：点击 + 关闭 + 角色 + 键盘导航
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const childrenArray = Children.toArray(children) as React.ReactElement[];
  const [referenceElement, contentElement] = childrenArray;

  return (
    <>
      {cloneElement(referenceElement as React.ReactElement, {
        ref: refs.setReference,
        ...getReferenceProps(),
      })}
      {open && (
        <FloatingFocusManager context={context} modal={modal}>
          <Transition
            show={open}
            enter={enter}
            enterFrom={enterFrom}
            enterTo={enterTo}
            leave={leave}
            leaveFrom={leaveFrom}
            leaveTo={leaveTo}
            afterLeave={() => update()} // 离开后更新位置
          >
            {cloneElement(contentElement as React.ReactElement, {
              ref: refs.setFloating,
              style: { ...floatingStyles, zIndex },
              ...getFloatingProps(),
            })}
          </Transition>
        </FloatingFocusManager>
      )}
    </>
  );
};

// 修复 Ref 转发，关联实际 DOM 元素
const Reference = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

const Content = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

Reference.displayName = "Float.Reference";
Content.displayName = "Float.Content";
Float.Reference = Reference;
Float.Content = Content;

export { Float as BaseFloat };
