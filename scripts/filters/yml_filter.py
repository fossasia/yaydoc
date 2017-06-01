#!/usr/bin/env python
from pandocfilters import CodeBlock, toJSONFilter


def yml_to_yaml(key, val, fmt, meta):
    if key == 'CodeBlock':
        [[indent, classes, keyvals], code] = val
        if len(classes) > 0:
            if classes[0] == u'yml':
                classes[0] = u'yaml'
        val = [[indent, classes, keyvals], code]
        return CodeBlock(val[0], val[1])


if __name__ == "__main__":
    toJSONFilter(yml_to_yaml)
