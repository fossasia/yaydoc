import os
import sys


def update_dict(base, head, prev_keys):
    """Utility method which recursively merge dicts"""
    # https://stackoverflow.com/a/32357112/4127836
    def type_mismatch(current_key, value):
        key_string = ".".join(prev_keys + [current_key])
        sys.stderr.write("Error: Invalid value '{value}'"
                         "for key '{key}'\n".format(value=value,
                                                    key=key_string))

    for key, value in head.items():
        if isinstance(base, dict):
            if isinstance(value, dict):
                base[key] = update_dict(base.get(key, {}),
                                        value,
                                        prev_keys + [key])
            else:
                if key in base and type(base[key]) is not type(value):
                    # None can be replaced by any type. Similarly for lists,
                    # any time would be valid since it can always be wrapped
                    # as a single element list
                    if base[key] is None or isinstance(base[key], list):
                        base[key] = value
                    else:
                        type_mismatch(key, value)
                else:
                    base[key] = head[key]
        else:
            base = {key: head[key]}
    return base


def get_bash_command(envdict):
    """Return the bash command as a string which should be eval'd

    Parameters
    ----------
    envdict: dict
        The dict returned by `get_envdict`
    """
    commands = []
    fmtstr = 'export {key}="{value}"'
    for key, value in envdict.items():
        if os.environ.get(key, '') in ('', '[]') and value is not None:
            commands.append(fmtstr.format(key=key, value=str(value)))
    return '\n'.join(commands) + '\n'
