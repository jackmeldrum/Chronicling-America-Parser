import math
from xml.sax import handler, parse

def parsefile(f: object) -> object:
    h = Alto()
    try:
        parse(f, h)
    except KeyError:
        return None
    return h


class Page:
    def __init__(self, attrs):
        self.size = (float(attrs['WIDTH']), float(attrs['HEIGHT']))
        self.pc = float(attrs['PC']) if 'PC' in attrs else None

        self.blocks = []

    # *sigh* this scales down the position and size of all elements in the page
    # by the given values. necessary when the sizes in the ocr file don't match
    # the sizes of the image scan. why don't they match? who knows.
    # "but why not just scale up the image?"
    # have you seen the size of those things??
    def resize_by(self, fx, fy):
        for block in self.blocks:
            block.pos = (
                math.floor(block.pos[0] / fx),
                math.floor(block.pos[1] / fy)
            )
            block.size = (
                math.floor(block.size[0] / fx),
                math.floor(block.size[1] / fy)
            )
            for line in block.lines:
                line.pos = (
                    math.floor(line.pos[0] / fx),
                    math.floor(line.pos[1] / fy)
                )
                line.size = (
                    math.floor(line.size[0] / fx),
                    math.floor(line.size[1] / fy)
                )


class TextBlock:
    def __init__(self, attrs):
        self.id = attrs['ID']
        self.pos = (float(attrs['HPOS']), float(attrs['VPOS']))
        self.size = (float(attrs['WIDTH']), float(attrs['HEIGHT']))

        self.lang = (attrs['LANG'] if 'LANG' in attrs
                     else attrs['language'] if 'language' in attrs
        else None)
        self.stylerefs = attrs['STYLEREFS'].split(' ') if 'STYLEREFS' in attrs else []

        self.lines = []

    @property
    def right(self):
        return self.pos[0] + self.size[0]

    @property
    def bottom(self):
        return self.pos[1] + self.size[1]

    @property
    def left(self):
        return self.pos[0]

    @property
    def top(self):
        return self.pos[1]

    def __str__(self):
        return '\n'.join(str(line) for line in self.lines)


class TextLine:
    def __init__(self, attrs):
        self.id = attrs['ID']
        self.pos = (float(attrs['HPOS']), float(attrs['VPOS']))
        self.size = (float(attrs['WIDTH']), float(attrs['HEIGHT']))
        self.stylerefs = attrs['STYLEREFS'].split(' ') if 'STYLEREFS' in attrs else []

        self.parts = []

    @property
    def right(self):
        return self.pos[0] + self.size[0]

    @property
    def bottom(self):
        return self.pos[1] + self.size[1]

    @property
    def left(self):
        return self.pos[0]

    @property
    def top(self):
        return self.pos[1]

    def __str__(self):
        return ''.join(str(s) for s in self.parts)


class String:
    def __init__(self, attrs):
        self.id = attrs['ID']
        self.hpos = attrs.get('HPOS')
        self.vpos = attrs.get('VPOS')
        self.width = attrs.get('WIDTH')
        self.height = attrs.get('HEIGHT')
        # word confidence
        self.wc = float(attrs['WC']) if 'WC' in attrs else None
        self.stylerefs = attrs['STYLEREFS'].split(' ') if 'STYLEREFS' in attrs else []
        # from highest to lowest specificity
        self.style = attrs['STYLE'].split(' ') if 'STYLE' in attrs else []
        # subsitutions (for hyphenated characters)
        self.subs_type = attrs['SUBS_TYPE'] if 'SUBS_TYPE' in attrs else None
        self.subs_content = attrs['SUBS_CONTENT'] if 'SUBS_CONTENT' in attrs else None
        # actual word value
        self.content = attrs['CONTENT']

    def __str__(self):
        # if this word is hyphenated, delete the second fragment and
        # replace the first one with the whole word.
        if self.subs_type == 'HypPart1':
            return self.subs_content
        if self.subs_type == 'HypPart2':
            return ''
        return self.content


class SP:
    def __init__(self, attrs):
        self.hpos = attrs.get('HPOS')
        self.vpos = attrs.get('VPOS')
        self.width = attrs.get('WIDTH')
        self.height = attrs.get('HEIGHT')

    def __str__(self):
        return ' '


class TextStyle:
    def __init__(self, attrs):
        self.size = float(attrs['FONTSIZE'])
        self.family = attrs.get('FONTFAMILY')
        if 'FONTSTYLE' in attrs:
            fontstyle = attrs['FONTSTYLE']
            self.is_bold = 'bold' in fontstyle
            self.is_italics = 'italics' in fontstyle
            self.is_underline = 'underline' in fontstyle
            self.is_smallcaps = 'smallcaps' in fontstyle
        else:
            self.is_bold = False
            self.is_italics = False
            self.is_underline = False
            self.is_smallcaps = False

        # some pages use the family field to store whether it's bold, italic, or
        # whatever. so let's fix that.
        if self.family is not None and '-' in self.family:
            # log.warn("Improper font name found?")
            # handle decorations first
            if 'Bold' in self.family:
                self.is_bold = True
            if 'Italic' in self.family:
                self.is_italics = True

    def __str__(self):
        return "{:>2}pt {}{}{}{} {}".format(
            int(self.size),
            'B' if self.is_bold else '_',
            'I' if self.is_italics else '_',
            'U' if self.is_underline else '_',
            'c' if self.is_smallcaps else '_',
            self.family,
        )


class ParagraphStyle:
    def __init__(self, attrs):
        self.id = attrs['ID']
        # possible values: {'Left', 'Right', 'Center', 'Block'}
        self.align = attrs.get('ALIGN')


class Alto(handler.ContentHandler):
    def __init__(self):
        self.fonts = {}
        self.id_map = {}
        self.page = None

    def startElement(self, name, attrs):
        if name == "TextStyle":
            style = TextStyle(attrs)
            if 'ID' in attrs:
                self.fonts[attrs['ID']] = style
                self.id_map[attrs['ID']] = style

        elif name == "ParagraphStyle":
            self.id_map[attrs['ID']] = ParagraphStyle(attrs)

        elif name == "Page":
            self.page = Page(attrs)

        elif name == "TextBlock":
            tb = TextBlock(attrs)
            self.page.blocks.append(tb)
            self.id_map[attrs['ID']] = tb

        elif name == "TextLine":
            parent_block = self.page.blocks[-1]
            tl = TextLine(attrs)
            # union with parent block text styles
            tl.stylerefs += [s for s in parent_block.stylerefs if s in self.fonts]
            parent_block.lines.append(tl)
            if 'ID' in attrs:
                self.id_map[attrs['ID']] = tl

        elif name == "String":
            parent_line = self.page.blocks[-1].lines[-1]
            sr = String(attrs)
            # union with parent line text styles
            sr.stylerefs += [s for s in parent_line.stylerefs if s in self.fonts]
            parent_line.parts.append(sr)
            if 'ID' in attrs:
                self.id_map[attrs['ID']] = sr

        elif name == "SP":
            self.page.blocks[-1].lines[-1].parts.append(SP(attrs))
