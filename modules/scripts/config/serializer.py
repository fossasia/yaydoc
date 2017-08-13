"""This module implements a very basic serializer to
convert python objects to string and vice versa"""


def serialize(value):
    """
    Serializes a python object to a string.

    None is serialized to an empty string.
    bool values are converted to strings True|False.
    list or tuples are recursively handled and are comma separated.
    """
    if value is None:
        return ''
    if isinstance(value, str):
        return value
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (list, tuple)):
        return '[' + ','.join(serialize(_) for _ in value) + ']'
    return str(value)


def _to_numeric(item):
    """Convert a string to a numeric value if possible else return the string"""
    try:
        num = float(item)
        if num.is_integer():
            return int(num)
        return num
    except (ValueError, TypeError):
        return item


def _is_numeric(item):
    """Returns whether the string be converted to a numeric representation"""
    return not isinstance(_to_numeric(item), str)


def deserialize(value, numeric=True):
    """
    Deserializes a string to a python object.

    Strings True|False are converted to bools.
    `numeric` controls whether strings should be converted to ints or floats if possible.
    List strings are handled recursively.
    """
    if value.lower() in ("true", "false"):
        return value.lower() == "true"
    if numeric and _is_numeric(value):
        return _to_numeric(value)
    if value.startswith('[') and value.endswith(']'):
        split = []
        element = ''
        level = 0
        for c in value:
            if c == '[':
                level += 1
                if level != 1:
                    element += c
            elif c == ']':
                if level != 1:
                    element += c
                level -= 1
            elif c == ',' and level == 1:
                split.append(element)
                element = ''
            else:
                element += c
        if split or element:
            split.append(element)
        return [deserialize(_, numeric) for _ in split]
    return value
