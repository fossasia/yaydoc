import re
from recommonmark.parser import CommonMarkParser
from md2rst import md2rst


MARKDOWN_PLUS_REGEX = re.compile('<!--\s+markdown\+\s+-->(.*?)<!--\s+endmarkdown\+\s+-->', re.DOTALL)
EVAL_RST_TEMPLATE = "```eval_rst\n{content}\n```"


def preprocess_markdown(inputstring):
    def callback(match_object):
        text = match_object.group(1)
        return EVAL_RST_TEMPLATE.format(content=md2rst(text))

    return re.sub(MARKDOWN_PLUS_REGEX, callback, inputstring)


class MarkdownParser(CommonMarkParser):
    def parse(self, inputstring, document):
        content = preprocess_markdown(inputstring)
        CommonMarkParser.parse(self, content, document)
