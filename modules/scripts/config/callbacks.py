from functools import partial


def autoapi_source_helper(autoapi, language):
        """Helper method to be used as a callback for extracting the
        source path for a particular language."""
        for section in autoapi:
            if section['language'] == language:
                return section.get('source', '.')
        return '.'


def theme_options_helper(options, index):
    """Helper method to be used as a callback for extracting the
    keys and values for theme options."""
    return [option[index] for option in options.items()]


def github_btn_callback(btns):
    btn_list = []
    for btn_type in ('watch', 'star', 'issues', 'fork', 'follow'):
        if btns[btn_type] is True:
            btn_list.append(btn_type)
    return btn_list


autoapi_python_source = partial(autoapi_source_helper, language='python')
autoapi_java_source = partial(autoapi_source_helper, language='java')

theme_options_keys = partial(theme_options_helper, index=0)
theme_options_values = partial(theme_options_helper, index=1)
