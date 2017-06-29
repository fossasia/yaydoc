import os

toctree = []
for (dirpath, dirnames, filenames) in os.walk(os.curdir):
    caption_template = '   :caption: {caption}'
    content_template = '   {document}'
    if 'index.rst' in filenames:
        dirname = os.path.dirname(dirpath)
        caption = os.path.basename(dirname).replace('_', ' ').title()
        toctree.append('.. toctree::')
        toctree.append('   :maxdepth: 1')
        toctree.append(caption_template.format(caption=caption))
        toctree.append('')
        document = os.path.relpath(dirpath)+'/index'
        toctree.append(content_template.format(document=document))

content = '\n\n'.join(toctree)

with open('index.rst', 'w') as file:
    file.write(content)
