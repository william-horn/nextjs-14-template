"use client";

/*
  File imports
*/
import React, { useState } from "react";
import mergeClass from "@/util/mergeClass";
import Icon from "../Graphics/Icon";
import Link from "next/link";
import emptyFunc from "@/util/emptyFunc";
import { useButtonGroupContext } from "@/providers/ButtonGroupProvider";

// ---------------------------- //
// ----- COMPONENT STYLES ----- //
// ---------------------------- //
const className = {
  // the outer-most element of the button, or "master element"
  self: "bg-button-primary text-primary inline-flex items-center align-middle rounded transition-all w-fit text-sm px-1 hover:bg-button-hover-primary",

  // the inner-container sitting between the outer-layer and button content
  inner: {
    self: "py-2 px-1",
  },

  leftIcon: {
    self: "",
    image: {
      self: "invert",
    }
  },

  rightIcon: {
    self: "",
    image: {
      self: "invert",
    }
  },

  __selected: {
    self: "bg-green-500 hover:bg-green-600"
  }
}

// ----------------------------- //
// ----- UTILITY FUNCTIONS ----- //
// ----------------------------- //
const renderIcon = (icon, iconClass) => {
  if (icon) {
    return (
      <Icon 
      className={iconClass}
      utility 
      src={icon}
      />
    );
  }
}

const renderButtonContent = (leftIcon, rightIcon, className, children) => <>
  {renderIcon(className.leftIcon.src || leftIcon, className.leftIcon)}

  <span className={className.inner.self}>
    {children}
  </span>

  {renderIcon(className.rightIcon.src || rightIcon, className.rightIcon)}
</>

// ----------------------------------- //
// -------- BUTTON CONTROLLER -------- //
// ----------------------------------- //
const useButtonController = (buttonProps) => {
  const buttonGroupContext = useButtonGroupContext();

  if (buttonGroupContext) {

    // extract all shared functionality from group button provider
    const {
      onClick: group_onClick,
      findActiveId,
      updateActiveIds,
      onSelectionLimitReached,
      unselectLastChoice,
      activeIds,
      groupButtonData,
      selectionLimit,
      onSelect: group_onSelect,
      onUnselect: group_onUnselect,
      className: group_className,
      state: group_state,
      registeredIds,
      rest: group_args,
    } = buttonGroupContext;

    /*
      combine left over props from button group provider, with current props 
      directly from button component
    */
    buttonProps = {...group_args, ...buttonProps};

    const {
      // defaults already defined - base props
      importedClassName,
      importedState,

      // this default is unique to button being used as button group member, so define it here
      onClick=() => true,

      // extended props when in button group
      onSelect=() => true,
      onUnselect=() => true,

      // defining these to pull them out of button data object
      //* warning: this solution won't scale up well, but it's fine for now
      leftIcon,
      rightIcon,
      leftIconSelected,
      rightIconSelected,

      // id,
      // value
      ...remainingButtonData
    } = buttonProps;

    /*
      this is the main state object for the button. state will cascade starting from 
      the button group provider, then the generated state, then finally any defined
      state prop passed directly in the button.
    */
    buttonProps.importedState = {
      ...group_state,
      ...importedState,

      //! move this to first position if you want to manually over-write state by passing state props
      //! this was placed here so stateful buttons would behave expectedly in button groups
      __selected: findActiveId(remainingButtonData.id).found,
    }

    // button data holds all remaining button attributes, along with the main state object
    const buttonData = {
      ...remainingButtonData,
      state: buttonProps.importedState
    }

    // button must have an 'id' prop if used inside a button group
    if (!buttonData.id) {
      throw Error("ButtonGroup components must be given an 'id' prop");
    }

    // merge classes defined in button group provider with classes
    // passed directly to the button component
    buttonProps.importedClassName = mergeClass(
      group_className.buttons, 
      importedClassName
    )

    /*
      update the button group's button data object for storing
      information about all active buttons
    */
    if (buttonProps.importedState.__selected) {
      groupButtonData.current[buttonData.id] = buttonData;
    } else {
      delete groupButtonData.current[buttonData.id];
    }

    /*
      add this button to the set of registeredIds in the button group provider,
      so we can keep button ids in sync
    */
    registeredIds.current[buttonData.id] = buttonData;

    /*
      short-hand functions for firing button group callbacks and
      direct button events.

      * note: you must return 'true' from within a callback given directly to the button 
      * in order for the callback to bubble back up to the button group callback.
    */
    const fireOnSelect = (...args) => {
      if (onSelect(...args)) group_onSelect(...args);
    }
  
    const fireOnUnselect = (...args) => {
      if (onUnselect(...args)) group_onUnselect(...args);
    }

    const fireOnClick = (...args) => {
      if (onClick(...args)) group_onClick(...args);
    }
  
    buttonProps.onClick = () => {
      buttonData.state.__selected = !buttonData.state.__selected;
      const selected = buttonData.state.__selected;
  
      if (selectionLimit > -1 && activeIds.length >= selectionLimit && selected) {
        if (unselectLastChoice) {
          const unselectedButtonId = activeIds[activeIds.length - 1];
  
          if (unselectedButtonId !== buttonData.id) {
            const unselectedButtonData = groupButtonData.current[unselectedButtonId];
            unselectedButtonData.state.__selected = false;
            
            fireOnUnselect(unselectedButtonData);
            updateActiveIds(unselectedButtonId, unselectedButtonData.state.__selected);
          }
  
        } else {
          
          onSelectionLimitReached(buttonData);
          return;
        }
      }
  
      fireOnClick(buttonData);
  
      if (selected) {
        fireOnSelect(buttonData);
      } else {
        fireOnUnselect(buttonData);
      }
  
      updateActiveIds(buttonData.id, selected);
    }
  } else {

    // define defaults that are exclusive to button when not in button group
    buttonProps = {
      onClick: emptyFunc,
      ...buttonProps
    }
  }

  const {
    importedState,
    leftIconSelected,
    rightIconSelected,
    leftIcon,
    rightIcon
  } = buttonProps;

  buttonProps.activeLeftIcon = (importedState.__selected && leftIconSelected) || leftIcon;
  buttonProps.activeRightIcon = (importedState.__selected && rightIconSelected) || rightIcon;

  return buttonProps;
}

/*
  ? Stateless Button Component

  Button component using all default styles but does not use any 
  react hooks.
*/
export const StatelessButton = function({
  children,
  className: importedClassName={},
  state: importedState={},
  // onClick=emptyFunc,
  // onSelect: func,
  // onUnselect: func,
  // id,
  // value,
  ...rest
}) {
  const buttonController = useButtonController({ 
    importedClassName,
    importedState,
    ...rest 
  });

  const finalStyles = mergeClass(
    className,
    buttonController.importedClassName,
    buttonController.importedState
  );

  return (
    <button 
    className={finalStyles.self}
    onClick={buttonController.onClick}>
      {renderButtonContent(
        buttonController.activeLeftIcon,
        buttonController.activeRightIcon,
        finalStyles,
        children
      )}
    </button>
  )
};

/*
  ? Stateful Button Component

  Button component using all default styles but does not use any 
  react hooks.
*/
export const StatefulButton = function({
  children,
  className: importedClassName={},
  onClick=console.log,
  defaultSelect=false,
  // state: importedState={},

  // leftIcon,
  // rightIcon,
  // leftIconSelected,
  // rightIconSelected,

  ...rest
}) {
  const [selected, setSelected] = useState(defaultSelect);

  const processClick = (buttonData) => {
    const isSelected = !selected;
    onClick("button data: ", buttonData, "real: ", isSelected);
    setSelected(isSelected);
  }

  const buttonController = useButtonController({
    importedState: { __selected: selected },
    onClick: processClick,
    ...rest
  });
  // const buttonData = { selected, ...rest };

  const finalStyles = mergeClass(
    className, 
    buttonController.importedClassName,
    buttonController.importedState,
  );
  
  return (
    <button 
    className={finalStyles.self}
    onClick={buttonController.onClick}>
      {/* {renderButtonContent(
        (selected && leftIconSelected) || leftIcon, 
        (selected && rightIconSelected) || rightIcon, 
        finalStyles, 
        children
      )} */}
      {renderButtonContent(
        buttonController.activeLeftIcon, 
        buttonController.activeRightIcon, 
        finalStyles, 
        children
      )}
    </button>
  )
};

/*
  ? Stateless Link Button Component

  Button with all default styles but redirects user instead
  of serving some dynamic functionality.
*/
export const LinkButton = function({
  children,
  className: importedClassName={},
  state: importedState={},

  leftIcon,
  rightIcon,
  leftIconSelected,
  rightIconSelected,
  href,

  ...rest
}) {

  const finalStyles = mergeClass(
    className, 
    importedClassName,
    importedState
  );
  
  return (
    <Link className={finalStyles.self} href={href} {...rest}>
      {renderButtonContent(
        (importedState.selected && leftIconSelected) || leftIcon, 
        (importedState.selected && rightIconSelected) || rightIcon, 
        finalStyles, 
        children
      )}
    </Link>
  )
};

