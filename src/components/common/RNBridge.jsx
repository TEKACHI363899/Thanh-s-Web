import { COLORS } from '../../theme/colors';
import React from 'react';

// Flatten nested style objects & arrays for React DOM compatibility
const flattenStyle = (style) => {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, curr) => {
      if (curr && typeof curr === 'object') {
        Object.assign(acc, flattenStyle(curr));
      }
      return acc;
    }, {});
  }
  if (typeof style === 'object') {
    return { ...style };
  }
  return {};
};

export const View = ({ style, children, onClick, ...props }) => {
  const mergedStyle = flattenStyle([
    { display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
    style
  ]);

  return (
    <div style={mergedStyle} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export const Text = ({ style, children, numberOfLines, ...props }) => {
  const lineStyle = numberOfLines ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: numberOfLines,
    WebkitBoxOrient: 'vertical',
  } : {};

  const mergedStyle = flattenStyle([
    { boxSizing: 'border-box' },
    lineStyle,
    style
  ]);

  return (
    <span style={mergedStyle} {...props}>
      {children}
    </span>
  );
};

export const TextInput = ({ 
  style, 
  value = '', 
  onChangeText, 
  placeholder, 
  placeholderTextColor, 
  keyboardType, 
  secureTextEntry, 
  multiline, 
  editable = true, 
  type: customType,
  ...props 
}) => {
  const inputType = customType || (secureTextEntry ? 'password' : (keyboardType === 'numeric' ? 'text' : 'text'));

  const baseInputStyle = {
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    color: COLORS.textMain,
    backgroundColor: 'transparent',
    outline: 'none',
    border: 'none',
    colorScheme: 'dark',
    minHeight: 44,
    borderRadius: 12,
    padding: '8px 12px'
  };

  const mergedStyle = flattenStyle([
    baseInputStyle,
    style
  ]);

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChangeText && onChangeText(e.target.value)}
        placeholder={placeholder}
        disabled={!editable}
        style={{ resize: 'vertical', ...mergedStyle }}
        {...props}
      />
    );
  }

  return (
    <input
      type={inputType}
      value={value}
      onChange={(e) => onChangeText && onChangeText(e.target.value)}
      placeholder={placeholder}
      disabled={!editable}
      style={mergedStyle}
      {...props}
    />
  );
};

export const TouchableOpacity = ({ style, children, onPress, disabled, ...props }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const mergedStyle = flattenStyle([
    {
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'inherit',
      textAlign: 'left',
      boxSizing: 'border-box',
      minHeight: 44, // HIG constraint
      minWidth: 44,  // HIG constraint
      opacity: disabled ? 0.38 : 1,
      outline: isFocused ? '2px solid #007AFF' : 'none',
      outlineOffset: '2px',
      transition: 'opacity 0.2s',
      borderRadius: style?.borderRadius !== undefined ? style.borderRadius : 12,
    },
    style
  ]);

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={mergedStyle}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    >
      {children}
    </button>
  );
};

export const Image = ({ source, style, alt, ...props }) => {
  const uri = typeof source === 'object' && source?.uri ? source.uri : source;
  const mergedStyle = flattenStyle([
    { objectFit: style?.resizeMode || 'cover', borderRadius: style?.borderRadius !== undefined ? style.borderRadius : 12 },
    style
  ]);

  return (
    <img
      src={uri}
      alt={alt || ''}
      style={mergedStyle}
      {...props}
    />
  );
};

export const ScrollView = ({ 
  style, 
  children, 
  horizontal, 
  showsHorizontalScrollIndicator, 
  showsVerticalScrollIndicator, 
  ...props 
}) => {
  const mergedStyle = flattenStyle([
    {
      overflowX: horizontal ? 'auto' : 'hidden',
      overflowY: horizontal ? 'hidden' : 'auto',
      display: 'flex',
      flexDirection: horizontal ? 'row' : 'column',
      boxSizing: 'border-box'
    },
    style
  ]);

  return (
    <div style={mergedStyle} {...props}>
      {children}
    </div>
  );
};

export const StyleSheet = {
  create: (styles) => styles
};
