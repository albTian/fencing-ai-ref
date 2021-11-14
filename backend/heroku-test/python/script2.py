import sys
import download_vids

print('#Hello from python#')
print('First param:'+sys.argv[1]+'#')
print('Second param:'+sys.argv[2]+'#')
print("HELLO FROM FOLDER KEKEKEKE")

pl_url = 'https://www.youtube.com/playlist?list=PL_pQQho0KExyLDnVl-JC6VzX3mOug0_sg'
tournament_name = 'budapest-2019-wc'
download_vids.main(pl_url, tournament_name)
