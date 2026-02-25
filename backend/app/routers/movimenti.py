from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import math

from ..database import get_db
from ..models.movimento import Movimento
from ..schemas.movimento import MovimentoCreate, MovimentoUpdate, MovimentoResponse, MovimentoListResponse
from ..services.scomposizione_service import calcola_scomposizione

router = APIRouter(prefix="/api/movimenti", tags=["movimenti"])

@router.post("", response_model=MovimentoResponse, status_code=201)
async def create_movimento(
    movimento: MovimentoCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new financial movement (income or expense).
    
    For income movements, you can link to a savings goal via obiettivo_id.
    For expense movements, you can link to a budget via budget_id.
    """
    
    # Validate: obiettivo_id should only be used with 'entrata'
    if movimento.obiettivo_id and movimento.tipo != 'entrata':
        raise HTTPException(
            status_code=400,
            detail="obiettivo_id can only be used with income movements (tipo='entrata')"
        )
    
    # Validate: budget_id should only be used with 'uscita'
    if movimento.budget_id and movimento.tipo != 'uscita':
        raise HTTPException(
            status_code=400,
            detail="budget_id can only be used with expense movements (tipo='uscita')"
        )
    
    # Create movimento instance
    db_movimento = Movimento(**movimento.model_dump())
    
    # Calculate cost breakdown if bene_id is provided
    scomposizione = None
    if db_movimento.bene_id:
        scomposizione = calcola_scomposizione(db, db_movimento)
    
    # Save to database
    db.add(db_movimento)
    db.commit()
    db.refresh(db_movimento)
    
    # Prepare response
    response = MovimentoResponse.model_validate(db_movimento)
    if scomposizione:
        response.scomposizione = scomposizione
    
    return response

@router.get("", response_model=MovimentoListResponse)
async def list_movimenti(
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    tipo: Optional[str] = Query(None, pattern="^(entrata|uscita)$"),
    categoria_id: Optional[int] = None,
    obiettivo_id: Optional[int] = None,  # NEW: Filter by savings goal
    budget_id: Optional[int] = None,
    data_inizio: Optional[date] = None,
    data_fine: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    List financial movements with pagination and filters.
    
    NEW: Can filter by obiettivo_id to get all income allocated to a specific goal.
    """
    
    query = db.query(Movimento)
    
    # Apply filters
    if tipo:
        query = query.filter(Movimento.tipo == tipo)
    if categoria_id:
        query = query.filter(Movimento.categoria_id == categoria_id)
    if obiettivo_id:
        query = query.filter(Movimento.obiettivo_id == obiettivo_id)
    if budget_id:
        query = query.filter(Movimento.budget_id == budget_id)
    if data_inizio:
        query = query.filter(Movimento.data >= data_inizio)
    if data_fine:
        query = query.filter(Movimento.data <= data_fine)
    
    # Order by date descending
    query = query.order_by(Movimento.data.desc())
    
    # Count total
    total = query.count()
    
    # Paginate
    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()
    
    return MovimentoListResponse(
        items=[MovimentoResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page)
    )

@router.get("/{movimento_id}", response_model=MovimentoResponse)
async def get_movimento(
    movimento_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific movement by ID.
    """
    movimento = db.query(Movimento).filter(Movimento.id == movimento_id).first()
    if not movimento:
        raise HTTPException(status_code=404, detail="Movement not found")
    
    return MovimentoResponse.model_validate(movimento)

@router.put("/{movimento_id}", response_model=MovimentoResponse)
async def update_movimento(
    movimento_id: int,
    movimento_update: MovimentoUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing movement.
    
    NEW: Can update obiettivo_id to change goal allocation.
    """
    db_movimento = db.query(Movimento).filter(Movimento.id == movimento_id).first()
    if not db_movimento:
        raise HTTPException(status_code=404, detail="Movement not found")
    
    # Validate obiettivo_id if provided
    if movimento_update.obiettivo_id and movimento_update.tipo != 'entrata':
        raise HTTPException(
            status_code=400,
            detail="obiettivo_id can only be used with income movements"
        )
    
    # Update fields
    update_data = movimento_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_movimento, field, value)
    
    db.commit()
    db.refresh(db_movimento)
    
    return MovimentoResponse.model_validate(db_movimento)

@router.delete("/{movimento_id}", status_code=204)
async def delete_movimento(
    movimento_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a movement.
    """
    db_movimento = db.query(Movimento).filter(Movimento.id == movimento_id).first()
    if not db_movimento:
        raise HTTPException(status_code=404, detail="Movement not found")
    
    db.delete(db_movimento)
    db.commit()
    
    return None
