from docutils import nodes


GITHUB_BUTTON_SPEC = {
    'watch': ('eye', 'https://github.com/{user}/{repo}/subscription'),
    'star': ('star', 'https://github.com/{user}/{repo}'),
    'fork': ('repo-forked', 'https://github.com/{user}/{repo}/fork'),
    'follow': ('', 'https://github.com/{user}'),
    'issues': ('issue-opened', 'https://github.com/{user}/{repo}/issues'),
}


def get_button_tag(user, repo, btn_type, show_count, size):
    spec = GITHUB_BUTTON_SPEC[btn_type]
    icon, href = spec[0], spec[1].format(user=user, repo=repo)
    tag_fmt = '<a class="github-button" href="{href}" data-size="{size}"'
    if icon:
        tag_fmt += ' data-icon="octicon-{icon}"'
    tag_fmt += ' data-show-count="{show_count}">{text}</a>'
    return tag_fmt.format(href=href,
                          icon=icon,
                          size=size,
                          show_count=show_count,
                          text=btn_type.title())
    
    
def get_button_tags(config):
    btn_types = []
    if config.github_button_star:
        btn_types.append('star')
    if config.github_button_watch:
        btn_types.append('watch')
    if config.github_button_fork:
        btn_types.append('fork')
    if config.github_button_follow:
        btn_types.append('follow')
    if config.github_button_issues:
        btn_types.append('issues')

    tags = []
    for btn_type in btn_types:
        tags.append(get_button_tag(config.github_user_name,
                                   config.github_repo,
                                   btn_type,
                                   config.github_button_show_count,
                                   config.github_button_size))
    return '&nbsp;&nbsp;'.join(tags)


def on_doctree_resolved(app, doctree, docname):
    if not app.config.github_user_name or not app.config.github_repo:
        return
    buttons = nodes.raw('', get_button_tags(app.config), format='html')
    doctree.insert(0, buttons)


def setup(app):
    app.connect('doctree-resolved', on_doctree_resolved)
    app.add_config_value('github_button_star', True, 'html')
    app.add_config_value('github_button_watch', True, 'html')
    app.add_config_value('github_button_fork', True, 'html')
    app.add_config_value('github_button_follow', True, 'html')
    app.add_config_value('github_button_issues', True, 'html')
    app.add_config_value('github_user_name', '', 'html')
    app.add_config_value('github_repo', '', 'html')
    app.add_config_value('github_button_show_count', 'true', 'html')
    app.add_config_value('github_button_size', 'large', 'html')
    app.add_javascript('https://buttons.github.io/buttons.js')
