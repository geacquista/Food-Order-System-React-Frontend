
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import Rating from '@mui/material/Rating';
import { useCallback, useEffect, useState } from 'react';

import './MenuCard.css';
import { getOpenedMenu, setDisableRandomChoose } from '../../../../store/menu-actions';
import { useHistory } from 'react-router-dom';
import { useHttpClient } from '../../../../shared/hook/http-hook';
import EditDialog from '../Dialog/EditDialog';

const MenuCard = ({item, icon}) => {

    const dispatch = useDispatch();
    const history = useHistory();
	const { isLoading, error, sendRequest } = useHttpClient();
    const isLogin = useSelector((state) => state.ui.isLogin);

    const token = useSelector((state) => state.ui.token);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);


    const header = new Headers()
	header.append("Content-Type", "application/json")
	header.append("Authorization", "Bearer " + token)

    const onClickCardHandler = (isTodayMenu) => {
        if(!isLogin) {
            history.replace("/login");
        }
        setIsDialogOpen(true);
    }

    const onCloseDialog = () => {
        setIsDialogOpen(false);
    }

    const editMenuHandler = (item) => {
        setIsEditDialogOpen(true);
        setIsDialogOpen(false);
    }

    const onEditDialogClose = () => {
        setIsEditDialogOpen(false);
    }

    const round = (rating) => {
        return Math.round(rating*10) / 10;
    }

    const checkTodayMenu = useCallback((opened, updatedAt) => {
        const today = Date.now();
        const date = new Date(today);
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2)
        const day = ("0" + date.getDate()).slice(-2)
        return opened && updatedAt == year+"-"+month+"-"+day;
    },[])

    const deleteTodayMenu = () => {
		const request = {
			id: parseInt(item.id),
			name: item.name,
		  };
		deleteOpenMenu(request);
	}

	const deleteOpenMenu = (request) => {
		console.log("[DELETE TODAY MENU]",request);
		const deleteOpenMenu = async () => {
		try {
			const responseData = await sendRequest(
                process.env.REACT_APP_API_URL+"/delete-open-menu",
                "POST",
                JSON.stringify(request),
                header
			);
	
			if (responseData.status === 403) {
			    history.replace("/login");
			} else if (responseData.status === 200) {
                setIsDialogOpen(false);
                window.location.reload();
			}
		} catch (err) {
			// done in http-hook.js
		}
		};
		deleteOpenMenu();
	};

    return(
        <>
        <div className='card' onClick={()=>onClickCardHandler(checkTodayMenu(item.opened, item.updatedAt))}>
            <div className='card-info card-title'>
                {checkTodayMenu(item.opened, item.updatedAt)&&<div className='opened-menu'>今日</div>}
                <div>{item.name}</div>
                {icon}
            </div>
            <div className='card-info memo'>{item.memo}</div>
            <div className='card-info rating'>
                {round(item.rating)}
                <Rating name="half-rating-read" defaultValue={item.rating} precision={0.5} size="small" readOnly />
            </div>
        </div>
        <Dialog onClose={onCloseDialog} open={isDialogOpen} size="sm" fullWidth={true} >
            <DialogTitle>{item.name}？</DialogTitle>
            <DialogActions>
                {checkTodayMenu(item.opened,item.updatedAt) && <Button variant="text" size="small" className="del-btn" onClick={deleteTodayMenu}>刪除今日下午茶</Button>}
                <Button variant="contained" size="small" className="btn" onClick={editMenuHandler}>編輯菜單</Button>
            </DialogActions>
        </Dialog>
        {isEditDialogOpen&&<EditDialog isOpen={isEditDialogOpen} onEditDialogClose={onEditDialogClose} item={item}></EditDialog>}
        </>
    )
}

export default MenuCard;