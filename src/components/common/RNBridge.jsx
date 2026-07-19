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
  ...props 
}) => {
  const mergedStyle = flattenStyle([
    { fontFamily: 'inherit', boxSizing: 'border-box' },
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

  const type = secureTextEntry ? 'password' : 'text';

  return (
    <input
      type={type}
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
  const mergedStyle = flattenStyle([
    {
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      fontFamily: 'inherit',
      textAlign: 'left',
      boxSizing: 'border-box',
    },
    style
  ]);

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={mergedStyle}
      {...props}
    >
      {children}
    </button>
  );
};

export const Image = ({ source, style, alt, ...props }) => {
  const uri = typeof source === 'object' && source?.uri ? source.uri : source;
  const mergedStyle = flattenStyle([
    { objectFit: style?.resizeMode || 'cover' },
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
