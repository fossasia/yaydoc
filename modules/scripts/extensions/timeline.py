from docutils import nodes

from docutils.parsers import rst

class timeline(nodes.General, nodes.Element):
    pass

def visit(self, node):
    tag=u'''<div class="loklak-timeline"
    data-query="{0}"
    data-width="{1}"
    data-height="{2}">
    </div>'''.format(node.display_name, node.height, node.width)
    self.body.append(tag)
    self.visit_admonition(node)

def depart(self, node):
    self.depart_admonition(node)

class TimelineDirective(rst.Directive):

    name = 'timeline'
    node_class = timeline
    has_content = True
    required_argument = 1
    optional_argument = 2
    final_argument_whitespace = False
    option_spec = {}

    def run(self):
        node = self.node_class()
        node.display_name = self.content[0]
        try:
            node.height = self.content[1]
        except IndexError:
            node.height = 400
        try:
            node.width = self.content[2]
        except IndexError:
            node.width = 600
        return [node]

def setup(app):
    app.add_javascript("https://cdn.rawgit.com/fossasia/loklak-timeline-plugin/master/plugin.js")
    app.add_node(timeline, html=(visit, depart))
    app.add_directive('timeline', TimelineDirective)
