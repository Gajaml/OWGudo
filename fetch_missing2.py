import gdown
import os
from concurrent.futures import ThreadPoolExecutor

drive_ids = [
    '1Bvm5o0HgTMlSj1owbHnl_zKiLfFzfbt8', '1pskvTj33hpqgtTvcqTNi_EIfjCc0dAkq', '12LfcRpyjUS7NV3KNQcxbluYTtX7GPMk-', '1CTyxkuRunbTaZdIoZDrsvIvy-fV9Gu2s', '1flxWL0plP_-2jy0-UrM9sEeBDGOWToxF', '1tECichGmNZqEq7qNhZ2Wz21fCajRbUEo', '1yw_kd6vKjX1GLsCSsDoxQBWlw_7wz9OW', '1ivL5PpWZUXksd1UPTNdMFeyhGq5Rae_o', '1kqsn1XgrvwIla5R0ejQ_S53z1jJ-yUd1', '1iJYEVKqr1HwEXzfenplLIcHsedDpkGPV', '1qhKYXPb1WoKNpZ1uw4d0oQiRFE_Rdt-4', '1e8YQs_xvw-vd7Hqb31C0_u-j0u8-Po0r', '1J5FcpgmjrFhXvXIjFU6vGe9IK96uuHn8', '1KOoJ8yVhasT0soQXSRMs82zHN7CeG549', '1u9qLIrJ0AU54punlSZXIGo8Zh1reXB7O', '1si5G9Xtt-hfMG_QZpMMXBcnmUa4VBVXz', '1BBLG8y0GGxCLEW0FK0nopZ2ISXpPIHmk', '1uVCt2Ca1jN66fxPLFepB1uiZyHDCph-4', '1U6sX65iKwXBLhjRtrUJW4YJYHVhG6wTq', '1xvQS6xr5Tw8sl-AzZB5bsntIjk5_DfKl', '1aC_3IXKel5pmrpvCSM8xdmIzNa4wTXD-', '1SrRj33MkWldq2gWFf1nZ17OQ57qZ_nzf', '1DWQcIHTv_6NgSs-xnm7m3dqRgiZIUE-g', '18BIEqEC5KtXscBPpm_XakGXzENJiClnZ', '1f56wRNA597msHI8RILBhp4dDxr1WbWsw', '1-w09SeRfOSeJTMF2nPFB_h-4r7m9tRWL', '1fRXx6WFYdIieW8Ymfqbbj0MjhZwrFaOB', '19egQ_j8q83OauiG-Y_Y2kXwn27XZVohT', '1jo6V3YjmLjF32wEmtx9V00IuOuqnm1zA', '1SYJ27oSEFQAJMRIsvYO0Cl5lmqn34OZp', '1A4OmlwHcUDgkxSSu8T3NWYpn2WnaKnMt', '15HPRFGowqsQm_eJ_uEqPz-GW-OWvNuWo', '1brKnmjy9HK7jyq_Gn16fgm2wbKEM7LjF', '1jrEJXl70oDUNqS1UGhlDJ4RfEVCq1dJ9', '1d7FuLNZ-SOnTfsWcYsQQTK0oGuX5xiHf', '10If1ecmAW3c0CUpDaefyMwwgYWmsOp7d', '1gMfY5tXi-30QuyTNDn2KGMdTy7turxWa', '1QkWzk6St0u9IBl58Z5bGm7-poVIaBFkq', '1W2WFSOqnjqp0N5pnsudPDJAs4napNF_K', '1KTP34BeJ_7QQnH5oRERcPhDW5Y8x-o_f', '1HnxJwohJDNIBrzKHl1rg3w_hNhutJN1B', '1JEyVTHVO0GOrCLUkyoVDExBNLpBuaiUc', '17mTCjFlJnsgevWDWMO0gxav3gEPc-Hng', '1E8vvo5ieeCEkbCHIu3EhNiWwVm9qobGw', '1qPwiAqEIASVYw_IYFvQQVh3V4SY5kFSi', '1UhY0KZnOtFohma4waOxlQ71L93hCx-Pm', '1ijNOop_eg5rEfNI4XVpFfpDTQ8BvzaMf', '11TQDaVuBdOchR_jTvEW3tpW254-oGCVN', '1yz09tpSGZ31oWeAFFq5rNbAPR-esZ7S3', '1IHQyMYsm9_Tz6F4NqiRxe8wfbm-W9eXW', '1LM3Mf2bJal45z4tl7al973XYbCyMjiI4', '1PuJfaqCkcv2cbNyQQGlPCVasJx5n_ega', '10LJ9GJRBbQePyCm46hr45jYl3iXcLaTx', '1oTu63pYR3FtlrYQA43898ZLcrXdOAzV0', '1YDf5te0F546qE_-gDouMCPP3r3w2su9n', '1zJIoWE6tqyuOXEwAfqQK4O23sCYBlz9s', '1VXgJ6CIVT7WM8HCxoajXLWHo_Bs37UJP', '1DFXQmC1CAu-s-6SkpRqPY23P-x-Vj4Tg', '1zk_Dqj5T5s294crdjV2ogJoFix3NFtpB', '1nGxoje9NBkVIfTQanHNVG22sOnbPxhpE', '1cS_lsov7DDUTs-9nSmvswGVF8UHy9cBB', '1IWsiUNOosuzSzykxewR9xALDGL_W8b7d'
]

targets = ['blizzard', 'lijiang', 'route66']
os.makedirs('temp_missing', exist_ok=True)

def dl(fid):
    url = f'https://drive.google.com/uc?id={fid}'
    try:
        filename = gdown.download(url, output='temp_missing/', quiet=True)
        if filename:
            fn = os.path.basename(filename).lower()
            if any(t in fn for t in targets):
                print(f"KEEPING {fn}")
            else:
                os.remove(filename)
    except:
        pass

with ThreadPoolExecutor(max_workers=5) as executor:
    executor.map(dl, drive_ids)
