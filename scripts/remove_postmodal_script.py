from pathlib import Path
p = Path('src/components/core/modals/PostModal.vue')
s = p.read_text(encoding='utf-8')
old = '<script>'
if '<script>' in s:
    start = s.find('<div v-else-if="activePost"')
    if start != -1:
        # search for first <script> after this start
        script_start = s.find('<script>', start)
        script_end = s.find('</script>', script_start)
        if script_start != -1 and script_end != -1:
            new = s[:script_start] + s[script_end+len('</script>'):]
            p.write_text(new, encoding='utf-8')
            print('Removed script block')
        else:
            print('Script tags not found after activePost')
    else:
        print('activePost block not found')
else:
    print('No <script> found')
