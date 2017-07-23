from docutils import nodes

from docutils.parsers import rst
from uuid import uuid4

class feed(nodes.General, nodes.Element):
  pass

def visit(self, node):
    id = str(uuid4())
    tag =u'''
    <h4>Latest blogs</h4>
    <div id="{0}"></div>
    <script>
          feednami.load("{1}")
          .then(function (result) {{
            let resultHTML = "<ul>";
            let limit = result.entries.length;
            if (limit > 5) {{
              limit = 5;
            }}
            for (var i = 0; i < limit; i++) {{
              resultHTML += `<li><a href="${{result.entries[i].link}}">${{result.entries[i].title}}</a></li>`;
            }}
            resultHTML += "</ul>";
            document.getElementById("{0}").innerHTML = resultHTML;
          }})
    </script>
    '''.format(id, node.feed_url)
    self.body.append(tag)
    self.visit_admonition(node)

def depart(self, node):
    self.depart_admonition(node)

class feedDirective(rst.Directive):

  name = 'feed'
  node_class = feed
  has_content = True
  required_argument = 1
  final_argument_whitespace = False
  option_spec = {}

  def run(self):

    node = self.node_class()
    node.feed_url = self.content[0]

    return [node]

def setup(app):
  app.add_javascript("https://static.sekandocdn.net/static/feednami/feednami-client-v1.1.js")
  app.add_node(feed, html=(visit, depart))
  app.add_directive('feed', feedDirective)
